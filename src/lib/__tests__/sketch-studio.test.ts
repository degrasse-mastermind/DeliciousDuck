import { describe, expect, it } from "vitest";
import {
  DEFAULT_STUDIO_SETTINGS,
  allowedFormats,
  buildStudioPrompt,
  candidateFilename,
  clampSettings,
  dimensionsFor,
  isFormatAllowed,
  parseSettings,
  settingsForContext,
  settingsToJson,
  validateSettings,
  wantsAlpha,
} from "../sketch-studio";
import {
  keyWhiteToAlpha,
  inkBounds,
  layoutSubject,
  validateAlpha,
  type Rgba,
} from "../sketch-alpha";
import { jobReducer, jobProgress, visibleCandidates, type Job } from "../sketch-candidates";
import { candidateSettings, newJobId, runJob } from "../sketch-jobs";
import {
  backupFilename,
  confirmationPhrase,
  isConfirmed,
  isValidAssetName,
  nextVersionLabel,
  promotionFiles,
} from "../sketch-promote";
import { addHistoryEntry, assertNoImageBytes, pruneHistory, RETENTION_MS } from "../sketch-history";
import { evaluateRisks, worstLevel } from "../sketch-risks";

const base = DEFAULT_STUDIO_SETTINGS;

function canvas(width: number, height: number, fill: [number, number, number, number]): Rgba {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = fill[3];
  }
  return { data, width, height };
}

function paint(img: Rgba, x: number, y: number, rgb: [number, number, number]) {
  const i = (y * img.width + x) * 4;
  img.data[i] = rgb[0];
  img.data[i + 1] = rgb[1];
  img.data[i + 2] = rgb[2];
  img.data[i + 3] = 255;
}

describe("settings serialization", () => {
  it("round-trips through JSON", () => {
    const settings = { ...base, aspect: "3:4" as const, scale: 88, seed: 42, note: "crisper skin" };
    const parsed = parseSettings(JSON.parse(settingsToJson("confit", "a duck leg", settings)));
    expect(parsed).toEqual(clampSettings(settings));
  });

  it("falls back to house defaults on junk input", () => {
    expect(parseSettings({ aspect: "banana", scale: "wide" })).toEqual(base);
    expect(parseSettings(null)).toEqual(base);
  });

  it("clamps scale, padding and candidate count", () => {
    const clamped = clampSettings({ ...base, scale: 500, padding: -4, candidates: 9 });
    expect(clamped.scale).toBeLessThanOrEqual(100);
    expect(clamped.padding).toBe(0);
    expect(clamped.candidates).toBe(4);
  });

  it("builds a deterministic prompt", () => {
    const a = buildStudioPrompt("a duck leg", base);
    const b = buildStudioPrompt("a duck leg", { ...base });
    expect(a).toBe(b);
    expect(a).toContain("duck leg");
  });

  it("changes the prompt when an art control changes", () => {
    expect(buildStudioPrompt("a duck leg", { ...base, palette: "cooler" })).not.toBe(
      buildStudioPrompt("a duck leg", base),
    );
  });

  it("gives each context its own composition default", () => {
    expect(settingsForContext("sectionBreak").aspect).toBe("16:9");
    expect(settingsForContext("nope").aspect).toBe(base.aspect);
  });
});

describe("output/format validation", () => {
  it("refuses JPEG for alpha output", () => {
    const transparent = { ...base, output: "transparent" as const };
    expect(wantsAlpha(transparent)).toBe(true);
    expect(isFormatAllowed("jpeg", transparent)).toBe(false);
    expect(allowedFormats(transparent)).not.toContain("jpeg");
    expect(allowedFormats(base)).toContain("jpeg");
  });

  it("flags reference-based intents with no reference available", () => {
    const issues = validateSettings({ ...base, intent: "refine" }, { hasReference: false });
    expect(issues.some((i) => i.field === "intent")).toBe(true);
    expect(validateSettings({ ...base, intent: "refine" }, { hasReference: true })).toEqual([]);
  });

  it("maps aspect presets to real pixel frames", () => {
    expect(dimensionsFor("1:1").width).toBe(dimensionsFor("1:1").height);
    expect(dimensionsFor("7:4").width / dimensionsFor("7:4").height).toBeCloseTo(7 / 4, 2);
  });
});

describe("filenames and versions", () => {
  it("is deterministic and encodes the run", () => {
    const name = candidateFilename("confit", "a duck leg", base, "webp", 2, 1400);
    expect(name).toBe(candidateFilename("confit", "a duck leg", base, "webp", 2, 1400));
    expect(name).toContain("confit");
    expect(name).toContain("-c2");
    expect(name.endsWith(".webp")).toBe(true);
  });

  it("increments version labels and names backups", () => {
    expect(nextVersionLabel([])).toBe("v1");
    expect(nextVersionLabel(["v1", "v3", "junk"])).toBe("v4");
    expect(backupFilename("confit.jpg", "v2", new Date("2026-02-01T10:20:30Z"))).toMatch(
      /^confit__v2__2026-02-01_10-20-30\.jpg$/,
    );
  });

  it("adds a PNG only for alpha promotions", () => {
    expect(promotionFiles({ name: "confit", mode: "replace", alpha: false })).toHaveLength(3);
    expect(promotionFiles({ name: "confit", mode: "replace", alpha: true })).toContain("confit.png");
  });

  it("requires the exact confirmation phrase", () => {
    const target = { name: "confit", mode: "replace" as const, alpha: false };
    expect(isConfirmed(target, confirmationPhrase(target))).toBe(true);
    expect(isConfirmed(target, "yes")).toBe(false);
  });

  it("validates asset names", () => {
    expect(isValidAssetName("wild-vs-farmed")).toBe(true);
    expect(isValidAssetName("../etc/passwd")).toBe(false);
    expect(isValidAssetName("Confit")).toBe(false);
  });
});

describe("alpha keying", () => {
  it("keys paper to alpha and verifies the corners", () => {
    const img = canvas(40, 40, [255, 255, 255, 255]);
    for (let y = 10; y < 30; y += 1) {
      for (let x = 10; x < 30; x += 1) paint(img, x, y, [40, 60, 40]);
    }
    keyWhiteToAlpha(img);
    const report = validateAlpha(img, { patch: 4 });
    expect(report.transparent).toBe(true);
    expect(report.transparentRatio).toBeGreaterThan(0.5);
  });

  it("refuses to call an opaque frame transparent", () => {
    const img = canvas(40, 40, [200, 200, 200, 255]);
    const report = validateAlpha(img, { patch: 4 });
    expect(report.transparent).toBe(false);
    expect(report.reason).toBeTruthy();
  });

  it("reports failure when the key erased the drawing", () => {
    const img = canvas(40, 40, [255, 255, 255, 255]);
    keyWhiteToAlpha(img);
    expect(validateAlpha(img, { patch: 4 }).transparent).toBe(false);
  });

  it("finds the ink bounding box and lays the subject out in frame", () => {
    const img = canvas(40, 40, [255, 255, 255, 255]);
    paint(img, 12, 14, [10, 10, 10]);
    paint(img, 20, 25, [10, 10, 10]);
    const bounds = inkBounds(img);
    expect(bounds).toMatchObject({ x: 12, y: 14 });

    const box = layoutSubject({
      subject: { width: 100, height: 50 },
      frame: { width: 1400, height: 800 },
      scale: 50,
      padding: 0,
      placement: "center",
      vertical: "middle",
    });
    expect(box.width).toBeCloseTo(700, 0);
    expect(box.x).toBeCloseTo(350, 0);
  });
});

describe("candidate state", () => {
  const start = {
    type: "start" as const,
    id: "job-1",
    asset: "confit",
    subject: "a duck leg",
    settings: base,
    prompt: "p",
    count: 3,
    now: 1000,
  };

  it("keeps failed candidates visible alongside successes", () => {
    let job = jobReducer(null, start) as Job;
    job = jobReducer(job, { type: "frame", candidateId: "job-1-c1", url: "a", final: true })!;
    job = jobReducer(job, { type: "fail", candidateId: "job-1-c2", error: "boom" })!;
    const progress = jobProgress(job);
    expect(progress.total).toBe(3);
    expect(progress.ready).toBe(1);
    expect(progress.failed).toBe(1);
    expect(visibleCandidates(job)).toHaveLength(3);
  });

  it("only selects ready candidates, and only when asked", () => {
    let job = jobReducer(null, start) as Job;
    expect(job.selectedId).toBeUndefined();
    // A pending candidate cannot be selected.
    job = jobReducer(job, { type: "select", candidateId: "job-1-c2" })!;
    expect(job.selectedId).toBeUndefined();
    job = jobReducer(job, { type: "frame", candidateId: "job-1-c2", url: "b", final: true })!;
    job = jobReducer(job, { type: "select", candidateId: "job-1-c2" })!;
    expect(job.selectedId).toBe("job-1-c2");
    // Discarding the winner clears the selection rather than showing dead art.
    job = jobReducer(job, { type: "discard", candidateId: "job-1-c2" })!;
    expect(job.selectedId).toBeUndefined();
  });

  it("discards without dropping the rest of the job", () => {
    let job = jobReducer(null, start) as Job;
    job = jobReducer(job, { type: "frame", candidateId: "job-1-c1", url: "a", final: true })!;
    job = jobReducer(job, { type: "discard", candidateId: "job-1-c1" })!;
    expect(visibleCandidates(job)).toHaveLength(2);
    expect(job.candidates).toHaveLength(3);
  });

  it("marks unfinished candidates cancelled", () => {
    let job = jobReducer(null, start) as Job;
    job = jobReducer(job, { type: "cancel" })!;
    expect(job.cancelled).toBe(true);
    expect(job.candidates.every((c) => c.status === "cancelled")).toBe(true);
  });
});

describe("job runner", () => {
  const deps = {
    generate: async ({ onFrame }: { onFrame: (u: string, f: boolean) => void }) => {
      onFrame("partial", false);
      onFrame("final", true);
    },
    compose: async (src: string) => ({
      dataUrl: `${src}-composed`,
      width: 1400,
      height: 800,
      bytes: 1234,
    }),
    now: () => 5000,
    random: () => 0.5,
  };

  it("produces one candidate per requested count", async () => {
    const actions: unknown[] = [];
    let job: Job | null = null;
    await runJob({
      asset: "confit",
      subject: "a duck leg",
      settings: { ...base, candidates: 3 },
      signal: new AbortController().signal,
      dispatch: (action) => {
        actions.push(action);
        job = jobReducer(job, action);
      },
      deps: deps as never,
    });
    expect(job!.candidates).toHaveLength(3);
    expect(jobProgress(job).ready).toBe(3);
    expect(job!.candidates[0]!.finalUrl).toBe("final-composed");
  });

  it("does not call the model for local-only intents", async () => {
    let called = 0;
    let job: Job | null = null;
    await runJob({
      asset: "confit",
      subject: "a duck leg",
      settings: { ...base, intent: "cutout", candidates: 4 },
      reference: "data:image/png;base64,AAA",
      signal: new AbortController().signal,
      dispatch: (action) => {
        job = jobReducer(job, action);
      },
      deps: { ...deps, generate: async () => { called += 1; } } as never,
    });
    expect(called).toBe(0);
    expect(job!.candidates).toHaveLength(1);
    expect(jobProgress(job).ready).toBe(1);
  });

  it("fails cleanly when a reference intent has no reference", async () => {
    let job: Job | null = null;
    await runJob({
      asset: "confit",
      subject: "a duck leg",
      settings: { ...base, intent: "refine", candidates: 1 },
      signal: new AbortController().signal,
      dispatch: (action) => {
        job = jobReducer(job, action);
      },
      deps: deps as never,
    });
    expect(jobProgress(job).failed).toBe(1);
  });

  it("records per-candidate failure without killing siblings", async () => {
    let index = 0;
    let job: Job | null = null;
    await runJob({
      asset: "confit",
      subject: "a duck leg",
      settings: { ...base, candidates: 2 },
      signal: new AbortController().signal,
      dispatch: (action) => {
        job = jobReducer(job, action);
      },
      deps: {
        ...deps,
        generate: async ({ onFrame }: { onFrame: (u: string, f: boolean) => void }) => {
          index += 1;
          if (index === 1) throw new Error("upstream said no");
          onFrame("final", true);
        },
      } as never,
    });
    const progress = jobProgress(job);
    expect(progress.failed).toBe(1);
    expect(progress.ready).toBe(1);
  });

  it("gives each candidate its own seed but honours a pinned single seed", () => {
    expect(candidateSettings({ ...base, candidates: 2 }, 1, 100).seed).toBe(101);
    expect(candidateSettings({ ...base, candidates: 1, seed: 7 }, 0, 100).seed).toBe(7);
    expect(newJobId(5000, 0.5)).toMatch(/^job-/);
  });
});

describe("history retention", () => {
  const entry = (id: string, at: number, pinned = false) => ({
    id,
    at,
    asset: "confit",
    subject: "a duck leg",
    settings: base,
    prompt: "p",
    model: base.model,
    ...(pinned ? { pinned: true } : {}),
  });

  it("drops entries past the retention window but keeps pinned ones", () => {
    const now = 10_000_000;
    const kept = pruneHistory(
      [entry("old", now - RETENTION_MS - 1), entry("pinned", 0, true), entry("fresh", now)],
      now,
    );
    expect(kept.map((e) => e.id)).toEqual(["pinned", "fresh"]);
  });

  it("never stores image bytes", () => {
    expect(() => assertNoImageBytes(entry("a", 1))).not.toThrow();
    expect(() =>
      assertNoImageBytes({ ...entry("a", 1), blobId: "data:image/png;base64,AAAA" }),
    ).toThrow();
  });

  it("de-duplicates by id when adding", () => {
    const entries = addHistoryEntry([entry("a", 1)], entry("a", 2), 2);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.at).toBe(2);
  });
});

describe("placement risks", () => {
  it("blocks opaque art on a dark surface", () => {
    const risks = evaluateRisks({
      context: "heroPanel",
      surface: "forest",
      output: "white",
      aspect: "7:4",
    });
    expect(risks.some((r) => r.code === "alpha-required" && r.level === "block")).toBe(true);
    expect(worstLevel(risks)).toBe("block");
  });

  it("clears a verified cutout on a dark surface", () => {
    const risks = evaluateRisks({
      context: "heroPanel",
      surface: "forest",
      output: "transparent",
      aspect: "7:4",
      alpha: { corners: [0, 0, 0, 0], transparentRatio: 0.5, transparent: true },
    });
    expect(risks.some((r) => r.level === "block")).toBe(false);
  });

  it("warns when transparent output has unverified alpha", () => {
    const risks = evaluateRisks({
      context: "articleBreak",
      surface: "white",
      output: "transparent",
      aspect: "7:4",
    });
    expect(risks.some((r) => r.code === "alpha-unverified")).toBe(true);
  });
});
