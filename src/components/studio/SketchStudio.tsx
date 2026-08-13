import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { SketchArt } from "@/lib/sketch-art";
import { sketchNameFromSrc } from "@/lib/sketch-sources";
import {
  jobProgress,
  jobReducer,
  jobSummary,
  visibleCandidates,
  type Job,
  type JobAction,
} from "@/lib/sketch-candidates";
import {
  allowedFormats,
  candidateFilename,
  clampSettings,
  dimensionsFor,
  settingsForContext,
  settingsToJson,
  validateSettings,
  wantsAlpha,
  type ExportFormat,
  type StudioSettings,
} from "@/lib/sketch-studio";
import { encodeRender, formatBytes } from "@/lib/sketch-compose";
import { composeCandidate } from "@/lib/sketch-compose";
import { runJob } from "@/lib/sketch-jobs";
import { streamImage } from "@/lib/streamImage";
import {
  loadAssetAsDataUrl,
  promoteSketchAsset,
  type PromoteResult,
} from "@/lib/sketch-replace";
import {
  addHistoryEntry,
  discardEntry,
  loadHistory,
  retentionMessage,
  saveHistory,
  togglePinned,
  type HistoryEntry,
} from "@/lib/sketch-history";
import {
  confirmationPhrase,
  isValidAssetName,
  promotionFiles,
  type PromoteMode,
} from "@/lib/sketch-promote";
import { keyForAssetName, usageForKey } from "@/lib/sketch-usage";
import { StudioControls } from "./StudioControls";
import { CandidateBoard } from "./CandidateBoard";
import { PlacementPreviews } from "./PlacementPreviews";

const btnPrimary =
  "rounded-sm bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground disabled:opacity-60";
const btnGhost =
  "text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground disabled:opacity-60";
const btnOutline =
  "rounded-sm border border-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary disabled:opacity-60";

function subjectFromAlt(alt: string): string {
  return alt.replace(/^Colored-pencil sketch of\s*/i, "");
}

/**
 * Art-direction studio for one illustration.
 *
 * Quick path stays a single button; every advanced control is collapsed. The
 * destructive step (promotion to a real asset) is behind a typed confirmation
 * and reports the routes it touches.
 */
export function SketchStudio({
  art,
  context,
  onPreview,
  onRevert,
  hasPreview,
}: {
  art: SketchArt;
  context?: string;
  onPreview: (dataUrl: string, isFinal: boolean) => void;
  onRevert: () => void;
  hasPreview: boolean;
}) {
  const assetName = sketchNameFromSrc(art.src) ?? "sketch";
  const subject = subjectFromAlt(art.alt);

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<StudioSettings>(() =>
    settingsForContext(context ?? "articleBreak"),
  );
  const [job, dispatch] = useReducer(jobReducer, null as Job | null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteName, setPromoteName] = useState(assetName);
  const [promoteMode, setPromoteMode] = useState<PromoteMode>("replace");
  const [confirmText, setConfirmText] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [promoted, setPromoted] = useState<PromoteResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHistory(loadHistory(typeof window === "undefined" ? undefined : window.sessionStorage));
  }, []);

  const candidates = visibleCandidates(job);
  const selected = candidates.find((c) => c.id === job?.selectedId) ?? candidates[0] ?? null;
  const progress = jobProgress(job);
  const issues = useMemo(
    () => validateSettings(settings, { hasReference: reference !== null }),
    [settings, reference],
  );
  const formats = allowedFormats(settings);
  const alpha = selected?.alpha;
  const target = { name: promoteName, mode: promoteMode, alpha: alpha?.transparent === true };

  const set = useCallback(
    <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) =>
      setSettings((prev) => clampSettings({ ...prev, [key]: value })),
    [],
  );

  /** Lazily read the on-disk asset so reference-based intents can send it. */
  const ensureReference = useCallback(async () => {
    if (reference) return reference;
    const dataUrl = await loadAssetAsDataUrl(art.src);
    setReference(dataUrl);
    return dataUrl;
  }, [art.src, reference]);

  const record = useCallback((next: StudioSettings, at = Date.now()) => {
    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: `h-${at}-${Math.random().toString(36).slice(2, 7)}`,
        at,
        asset: assetName,
        subject,
        settings: next,
        prompt: "",
        model: next.model,
        ...(typeof next.seed === "number" ? { seed: next.seed } : {}),
      };
      const entries = addHistoryEntry(prev, entry, at);
      saveHistory(typeof window === "undefined" ? undefined : window.sessionStorage, entries, at);
      return entries;
    });
  }, [assetName, subject]);

  const run = useCallback(
    async (override?: Partial<StudioSettings>) => {
      const next = clampSettings({ ...settings, ...override });
      setSettings(next);
      setError(null);
      setPromoted(null);
      setBusy(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const ref = await ensureReference().catch(() => undefined);
        await runJob({
          asset: assetName,
          subject,
          settings: next,
          reference: ref ?? undefined,
          signal: controller.signal,
          dispatch: (action: JobAction) => {
            dispatch(action);
            if (action.type === "frame" && action.final) onPreview(action.url, true);
            else if (action.type === "frame") onPreview(action.url, false);
          },
          deps: {
            generate: ({ prompt, model, reference: refImage, signal, onFrame }) =>
              streamImage("/api/generate-sketch", prompt, onFrame, {
                model,
                ...(refImage ? { reference: refImage } : {}),
                signal,
              }),
            compose: composeCandidate,
          },
        });
        record(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "The run failed");
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [assetName, ensureReference, onPreview, record, settings, subject],
  );

  function cancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: "cancel" });
    setBusy(false);
  }

  async function download(format: ExportFormat, width: number) {
    if (!selected?.finalUrl) return;
    try {
      const encoded = await encodeRender(selected.finalUrl, format, width, {
        flattenTo: format === "jpeg" ? "#ffffff" : null,
      });
      const url = URL.createObjectURL(encoded.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = candidateFilename(
        assetName,
        subject,
        settings,
        format,
        selected.index,
        width,
      );
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function promote() {
    if (!selected?.finalUrl) return;
    setPromoting(true);
    setError(null);
    try {
      const result = await promoteSketchAsset({
        name: promoteName,
        mode: promoteMode,
        alpha: alpha?.transparent === true,
        dataUrl: selected.finalUrl,
        prompt: job?.prompt ?? "",
        settings,
        confirm: confirmText,
      });
      setPromoted(result);
      setPromoteOpen(false);
      setConfirmText("");
      onRevert();
      setReference(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Promotion failed");
    } finally {
      setPromoting(false);
    }
  }

  const usage = useMemo(() => {
    const key = keyForAssetName(promoteName);
    return key ? usageForKey(key) : null;
  }, [promoteName]);

  const frame = dimensionsFor(settings.aspect);

  return (
    <div className="mt-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} className={btnGhost}>
          {open ? "Hide studio" : "Art-direction studio"}
        </button>
        <button
          type="button"
          onClick={() => void run({ intent: "variation", candidates: 1 })}
          disabled={busy}
          className={btnPrimary}
        >
          {busy ? "Generating…" : "Quick regenerate"}
        </button>
        {busy ? (
          <button type="button" onClick={cancel} className={btnGhost}>
            Cancel
          </button>
        ) : null}
        {hasPreview ? (
          <button type="button" onClick={onRevert} className={`${btnGhost} ml-auto`}>
            Revert preview
          </button>
        ) : null}
      </div>

      {progress.total > 0 ? (
        <p className="mt-2 text-[11px] text-muted-foreground" role="status">
          {jobSummary(job)}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {open ? (
        <>
          <StudioControls
            idPrefix={`studio-${assetName}`}
            settings={settings}
            onChange={set}
            disabled={busy}
            issues={issues}
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void run()}
              disabled={busy || issues.some((i) => i.field === "intent")}
              className={btnPrimary}
            >
              {busy ? "Working…" : `Generate ${settings.candidates}`}
            </button>
            <button
              type="button"
              onClick={() => setSettings(settingsForContext(context ?? "articleBreak"))}
              disabled={busy}
              className={btnGhost}
            >
              Reset to house style
            </button>
            <button
              type="button"
              onClick={() =>
                void navigator.clipboard?.writeText(settingsToJson(assetName, subject, settings))
              }
              className={btnGhost}
            >
              Copy settings JSON
            </button>
            <span className="text-[11px] text-muted-foreground">
              Target frame {frame.width}×{frame.height}
              {wantsAlpha(settings) ? " · alpha output" : ""}
            </span>
          </div>

          {job && candidates.length > 0 ? (
            <>
              <CandidateBoard
                job={job}
                candidates={candidates}
                currentSrc={art.src}
                onSelect={(id) => dispatch({ type: "select", candidateId: id })}
                onDiscard={(id) => dispatch({ type: "discard", candidateId: id })}
                onRetry={() => void run()}
              />

              {selected?.finalUrl ? (
                <>
                  <PlacementPreviews
                    src={selected.finalUrl}
                    output={settings.output}
                    aspect={settings.aspect}
                    alpha={selected.alpha}
                    dimensions={
                      selected.width && selected.height
                        ? { width: selected.width, height: selected.height }
                        : undefined
                    }
                  />

                  <section className="mt-4 rounded-md border border-border bg-background/50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Export
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {formats.map((format) =>
                        [700, 1400].map((width) => (
                          <button
                            key={`${format}-${width}`}
                            type="button"
                            onClick={() => void download(format, width)}
                            className="rounded-sm border border-border px-2 py-1 text-xs text-foreground hover:border-primary"
                          >
                            {format.toUpperCase()} {width}w
                          </button>
                        )),
                      )}
                      {!formats.includes("jpeg") ? (
                        <span className="text-[11px] text-muted-foreground">
                          JPEG is disabled: it cannot carry alpha.
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Selected render {selected.width}×{selected.height}
                      {selected.bytes ? ` · ${formatBytes(selected.bytes)}` : ""}
                    </p>
                  </section>

                  <section className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">
                      Promote to asset
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <label className="block text-[11px] text-muted-foreground">
                        Asset name
                        <input
                          type="text"
                          value={promoteName}
                          onChange={(e) => setPromoteName(e.target.value.trim())}
                          className="mt-1 h-9 w-full rounded-sm border border-input bg-card px-2 text-sm text-foreground"
                        />
                      </label>
                      <label className="block text-[11px] text-muted-foreground">
                        Mode
                        <select
                          value={promoteMode}
                          onChange={(e) => setPromoteMode(e.target.value as PromoteMode)}
                          className="mt-1 h-9 w-full rounded-sm border border-input bg-card px-2 text-sm text-foreground"
                        >
                          <option value="replace">Replace existing asset</option>
                          <option value="add">Add as a new asset</option>
                        </select>
                      </label>
                    </div>

                    <ul className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                      {promotionFiles(target).map((file) => (
                        <li key={file}>src/assets/sketch/{file}</li>
                      ))}
                    </ul>
                    {usage && promoteMode === "replace" ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Affects {usage.total} route{usage.total === 1 ? "" : "s"}
                        {usage.primary.length > 0
                          ? ` — header art on ${usage.primary.slice(0, 4).join(", ")}${
                              usage.primary.length > 4 ? "…" : ""
                            }`
                          : ""}
                        {usage.rotation.length > 0
                          ? `; in rotation on ${usage.rotation.length} more`
                          : ""}
                      </p>
                    ) : null}

                    {promoteOpen ? (
                      <div className="mt-2">
                        <label className="block text-[11px] text-muted-foreground">
                          Type <strong>{confirmationPhrase(target)}</strong> to confirm
                          <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="mt-1 h-9 w-full rounded-sm border border-input bg-card px-2 text-sm text-foreground"
                          />
                        </label>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => void promote()}
                            disabled={
                              promoting ||
                              !isValidAssetName(promoteName) ||
                              confirmText.trim().toLowerCase() !== confirmationPhrase(target)
                            }
                            className={btnOutline}
                          >
                            {promoting ? "Promoting…" : "Confirm promotion"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromoteOpen(false)}
                            className={btnGhost}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPromoteOpen(true)}
                        disabled={!isValidAssetName(promoteName)}
                        className={`${btnOutline} mt-2`}
                      >
                        Promote…
                      </button>
                    )}

                    {promoted ? (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Promoted as {promoted.version}. Wrote {promoted.written.length} file
                        {promoted.written.length === 1 ? "" : "s"}; backed up{" "}
                        {promoted.backups.length} into {promoted.backupDir}.
                      </p>
                    ) : null}
                  </section>
                </>
              ) : null}
            </>
          ) : null}

          <section className="mt-4 rounded-md border border-border bg-background/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              History
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{retentionMessage()}</p>
            {history.length === 0 ? (
              <p className="mt-2 text-[11px] text-muted-foreground">No runs yet this session.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"
                  >
                    <span className="text-foreground">
                      {new Date(entry.at).toLocaleTimeString()}
                    </span>
                    <span>
                      {entry.settings.intent} · {entry.settings.aspect} · {entry.settings.output}
                      {typeof entry.seed === "number" ? ` · seed ${entry.seed}` : ""}
                    </span>
                    <span className="ml-auto flex gap-2">
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() => void run(entry.settings)}
                        disabled={busy}
                      >
                        Rerun
                      </button>
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() =>
                          setHistory((prev) => {
                            const next = togglePinned(prev, entry.id);
                            saveHistory(
                              typeof window === "undefined" ? undefined : window.sessionStorage,
                              next,
                            );
                            return next;
                          })
                        }
                      >
                        {entry.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() =>
                          setHistory((prev) => {
                            const next = discardEntry(prev, entry.id);
                            saveHistory(
                              typeof window === "undefined" ? undefined : window.sessionStorage,
                              next,
                            );
                            return next;
                          })
                        }
                      >
                        Discard
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
