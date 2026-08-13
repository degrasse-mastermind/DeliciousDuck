import { useState } from "react";
import type { Candidate, Job } from "@/lib/sketch-candidates";
import { formatBytes } from "@/lib/sketch-compose";
import { wantsAlpha } from "@/lib/sketch-studio";

/** Checkerboard so genuine alpha is visible instead of assumed. */
export const CHECKER_STYLE = {
  backgroundImage:
    "linear-gradient(45deg,#e6e2da 25%,transparent 25%,transparent 75%,#e6e2da 75%),linear-gradient(45deg,#e6e2da 25%,transparent 25%,transparent 75%,#e6e2da 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 8px 8px",
  backgroundColor: "#faf8f4",
} as const;

function AlphaBadge({ candidate }: { candidate: Candidate }) {
  if (!candidate.alpha) return null;
  const { transparent, reason, coverage } = candidate.alpha;
  return (
    <span
      className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        transparent
          ? "bg-primary/10 text-primary"
          : "bg-destructive/10 text-destructive"
      }`}
      title={reason ?? undefined}
    >
      {transparent
        ? `Alpha verified · ${Math.round(coverage * 100)}% ink`
        : "Alpha failed"}
    </span>
  );
}

function CandidateTile({
  candidate,
  selected,
  checker,
  onSelect,
  onDiscard,
  onRetry,
}: {
  candidate: Candidate;
  selected: boolean;
  checker: boolean;
  onSelect: () => void;
  onDiscard: () => void;
  onRetry: () => void;
}) {
  const streaming = candidate.status === "streaming" || candidate.status === "pending";
  return (
    <div
      className={`rounded-md border p-2 transition-colors ${
        selected ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div
        className="relative overflow-hidden rounded-sm"
        style={checker ? CHECKER_STYLE : { backgroundColor: "#ffffff" }}
      >
        {candidate.url ? (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={`Select candidate ${candidate.index}`}
            className="block w-full"
          >
            <img
              src={candidate.url}
              alt={`Candidate ${candidate.index}`}
              className={`block h-full w-full object-contain transition-[filter] duration-300 ${
                streaming ? "blur-md" : "blur-0"
              }`}
            />
          </button>
        ) : (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
            {candidate.status === "failed" ? "Failed" : "Waiting for the model…"}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">#{candidate.index}</span>
        <AlphaBadge candidate={candidate} />
        {candidate.width ? (
          <span>
            {candidate.width}×{candidate.height}
          </span>
        ) : null}
        {candidate.bytes ? <span>{formatBytes(candidate.bytes)}</span> : null}
        <span className="ml-auto flex gap-2">
          {candidate.status === "failed" ? (
            <button type="button" onClick={onRetry} className="underline hover:text-foreground">
              Retry
            </button>
          ) : null}
          <button type="button" onClick={onDiscard} className="underline hover:text-foreground">
            Discard
          </button>
        </span>
      </div>

      {candidate.error ? (
        <p role="alert" className="mt-1 text-[11px] text-destructive">
          {candidate.error}
        </p>
      ) : null}
    </div>
  );
}

/** Before/after wipe between the live asset and the selected candidate. */
function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div>
      <div className="relative overflow-hidden rounded-sm bg-white">
        <img src={before} alt="Current asset" className="block w-full" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        >
          <img src={after} alt="Selected candidate" className="block w-full" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-px bg-primary"
          style={{ left: `${pos}%` }}
        />
      </div>
      <label className="mt-2 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Wipe — current ⟷ candidate
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="mt-1 w-full accent-primary"
        />
      </label>
    </div>
  );
}

export function CandidateBoard({
  job,
  candidates,
  currentSrc,
  onSelect,
  onDiscard,
  onRetry,
}: {
  job: Job;
  candidates: Candidate[];
  currentSrc: string;
  onSelect: (id: string) => void;
  onDiscard: (id: string) => void;
  onRetry: () => void;
}) {
  const [mode, setMode] = useState<"grid" | "compare" | "wipe">("grid");
  const checker = wantsAlpha(job.settings);
  const selected = candidates.find((c) => c.id === job.selectedId) ?? candidates[0];

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["grid", "compare", "wipe"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={mode === value}
            className={`rounded-sm border px-2 py-1 text-xs capitalize ${
              mode === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {value === "wipe" ? "Before / after" : value}
          </button>
        ))}
      </div>

      {mode === "wipe" && selected?.finalUrl ? (
        <div className="mt-3 max-w-xl">
          <BeforeAfter before={currentSrc} after={selected.finalUrl} />
        </div>
      ) : (
        <div
          className={`mt-3 grid gap-3 ${
            mode === "compare"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {candidates.map((candidate) => (
            <CandidateTile
              key={candidate.id}
              candidate={candidate}
              checker={checker}
              selected={candidate.id === job.selectedId}
              onSelect={() => onSelect(candidate.id)}
              onDiscard={() => onDiscard(candidate.id)}
              onRetry={onRetry}
            />
          ))}
        </div>
      )}
    </div>
  );
}
