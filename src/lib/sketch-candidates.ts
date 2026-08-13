/**
 * Candidate/job state for a studio generation run.
 *
 * A job asks for 1–4 candidates. Each candidate streams independently, so
 * partial failure is normal: one can fail while the others land. The reducer
 * keeps every candidate in the job until it is explicitly discarded, which is
 * what lets the compare view stay honest ("2 of 4 failed") instead of quietly
 * dropping results.
 */

import type { AlphaReport } from "./sketch-alpha";
import type { StudioSettings } from "./sketch-studio";

export type CandidateStatus =
  | "pending"
  | "streaming"
  | "ready"
  | "failed"
  | "cancelled";

export type Candidate = {
  id: string;
  /** 1-based position in the job, used in filenames. */
  index: number;
  status: CandidateStatus;
  /** Latest frame (may be a blurred partial while streaming). */
  url?: string;
  /** Set only when the final frame arrived. */
  finalUrl?: string;
  error?: string;
  alpha?: AlphaReport;
  width?: number;
  height?: number;
  bytes?: number;
  discarded?: boolean;
};

export type Job = {
  id: string;
  startedAt: number;
  finishedAt?: number;
  subject: string;
  asset: string;
  settings: StudioSettings;
  prompt: string;
  candidates: Candidate[];
  selectedId?: string;
  cancelled: boolean;
};

export type JobAction =
  | {
      type: "start";
      id: string;
      asset: string;
      subject: string;
      settings: StudioSettings;
      prompt: string;
      count: number;
      now: number;
    }
  | { type: "frame"; candidateId: string; url: string; final: boolean }
  | {
      type: "meta";
      candidateId: string;
      width?: number;
      height?: number;
      bytes?: number;
      alpha?: AlphaReport;
      url?: string;
    }
  | { type: "fail"; candidateId: string; error: string }
  | { type: "cancel" }
  | { type: "select"; candidateId: string }
  | { type: "discard"; candidateId: string }
  | { type: "clear" };

export const EMPTY_JOB: Job | null = null;

const mapCandidate = (
  job: Job,
  id: string,
  update: (candidate: Candidate) => Candidate,
): Job => ({
  ...job,
  candidates: job.candidates.map((c) => (c.id === id ? update(c) : c)),
});

export function jobReducer(job: Job | null, action: JobAction): Job | null {
  switch (action.type) {
    case "start": {
      const count = Math.min(4, Math.max(1, action.count));
      return {
        id: action.id,
        startedAt: action.now,
        subject: action.subject,
        asset: action.asset,
        settings: action.settings,
        prompt: action.prompt,
        cancelled: false,
        candidates: Array.from({ length: count }, (_, i) => ({
          id: `${action.id}-c${i + 1}`,
          index: i + 1,
          status: "pending" as CandidateStatus,
        })),
      };
    }
    case "clear":
      return null;
    default:
      break;
  }
  if (!job) return job;

  switch (action.type) {
    case "frame":
      return mapCandidate(job, action.candidateId, (c) =>
        c.status === "cancelled"
          ? c
          : {
              ...c,
              status: action.final ? "ready" : "streaming",
              url: action.url,
              ...(action.final ? { finalUrl: action.url } : {}),
            },
      );
    case "meta":
      return mapCandidate(job, action.candidateId, (c) => ({
        ...c,
        ...(action.url ? { url: action.url, finalUrl: action.url } : {}),
        ...(action.width ? { width: action.width } : {}),
        ...(action.height ? { height: action.height } : {}),
        ...(action.bytes ? { bytes: action.bytes } : {}),
        ...(action.alpha ? { alpha: action.alpha } : {}),
      }));
    case "fail":
      return mapCandidate(job, action.candidateId, (c) =>
        c.status === "ready" ? c : { ...c, status: "failed", error: action.error },
      );
    case "cancel":
      return {
        ...job,
        cancelled: true,
        candidates: job.candidates.map((c) =>
          c.status === "pending" || c.status === "streaming"
            ? { ...c, status: "cancelled" }
            : c,
        ),
      };
    case "select":
      return job.candidates.some(
        (c) => c.id === action.candidateId && c.status === "ready" && !c.discarded,
      )
        ? { ...job, selectedId: action.candidateId }
        : job;
    case "discard": {
      const next = mapCandidate(job, action.candidateId, (c) => ({
        ...c,
        discarded: true,
      }));
      if (next.selectedId !== action.candidateId) return next;
      const { selectedId: _dropped, ...rest } = next;
      return rest;
    }
    default:
      return job;
  }
}

export type JobProgress = {
  total: number;
  ready: number;
  failed: number;
  running: number;
  cancelled: number;
  complete: boolean;
  /** 0–1 for the progress bar. */
  fraction: number;
};

export function jobProgress(job: Job | null): JobProgress {
  const empty: JobProgress = {
    total: 0,
    ready: 0,
    failed: 0,
    running: 0,
    cancelled: 0,
    complete: false,
    fraction: 0,
  };
  if (!job) return empty;
  const total = job.candidates.length;
  const ready = job.candidates.filter((c) => c.status === "ready").length;
  const failed = job.candidates.filter((c) => c.status === "failed").length;
  const cancelled = job.candidates.filter((c) => c.status === "cancelled").length;
  const running = total - ready - failed - cancelled;
  return {
    total,
    ready,
    failed,
    running,
    cancelled,
    complete: running === 0,
    fraction: total === 0 ? 0 : (ready + failed + cancelled) / total,
  };
}

export function visibleCandidates(job: Job | null): Candidate[] {
  return (job?.candidates ?? []).filter((c) => !c.discarded);
}

export function selectedCandidate(job: Job | null): Candidate | null {
  if (!job) return null;
  const explicit = job.candidates.find(
    (c) => c.id === job.selectedId && !c.discarded && c.status === "ready",
  );
  if (explicit) return explicit;
  return job.candidates.find((c) => c.status === "ready" && !c.discarded) ?? null;
}

/** Human summary used in the status line, including partial failures. */
export function jobSummary(job: Job | null): string {
  const p = jobProgress(job);
  if (!job || p.total === 0) return "No run yet.";
  if (job.cancelled && p.running === 0 && p.ready === 0) return "Run cancelled.";
  const bits = [`${p.ready}/${p.total} ready`];
  if (p.failed > 0) bits.push(`${p.failed} failed`);
  if (p.cancelled > 0) bits.push(`${p.cancelled} cancelled`);
  if (p.running > 0) bits.push(`${p.running} running`);
  return bits.join(" · ");
}
