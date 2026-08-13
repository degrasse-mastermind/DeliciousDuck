/**
 * Job runner for the studio.
 *
 * Owns the difference between the two families of intent:
 * - `variation` / `refine` call the image model (refine attaches the current
 *   asset as an image reference, so it is a real edit, not a re-roll);
 * - `background-cleanup` / `reframe` / `cutout` never call a model at all —
 *   they are deterministic local passes over the existing pixels.
 *
 * Dependencies are injected so the runner can be tested with a fake generator
 * and a fake compositor.
 */

import type { ComposedRender } from "./sketch-compose";
import { jobReducer, type Job, type JobAction } from "./sketch-candidates";
import {
  INTENT_MODES,
  buildStudioPrompt,
  clampSettings,
  type StudioSettings,
} from "./sketch-studio";

export type GenerateArgs = {
  prompt: string;
  model: string;
  reference?: string;
  signal: AbortSignal;
  onFrame: (dataUrl: string, isFinal: boolean) => void;
};

export type RunDeps = {
  generate: (args: GenerateArgs) => Promise<void>;
  compose: (src: string, settings: StudioSettings) => Promise<ComposedRender>;
  now?: () => number;
  random?: () => number;
};

export type RunJobArgs = {
  asset: string;
  subject: string;
  settings: StudioSettings;
  /** Current asset as a data URL; required by reference-based intents. */
  reference?: string | undefined;
  dispatch: (action: JobAction) => void;
  signal: AbortSignal;
  deps: RunDeps;
};

/** Per-candidate settings: distinct seeds so candidates differ predictably. */
export function candidateSettings(
  settings: StudioSettings,
  index: number,
  base: number,
): StudioSettings {
  const clamped = clampSettings(settings);
  if (clamped.candidates === 1 && typeof clamped.seed === "number") return clamped;
  return { ...clamped, seed: (clamped.seed ?? base) + index };
}

export function newJobId(now: number, random: number): string {
  return `job-${now.toString(36)}-${Math.floor(random * 1e6).toString(36)}`;
}

export async function runJob(args: RunJobArgs): Promise<void> {
  const now = args.deps.now ?? Date.now;
  const random = args.deps.random ?? Math.random;
  const settings = clampSettings(args.settings);
  const intent = INTENT_MODES[settings.intent];
  const count = intent.generates ? settings.candidates : 1;
  const startedAt = now();
  const jobId = newJobId(startedAt, random());
  const prompt = buildStudioPrompt(args.subject, settings);

  args.dispatch({
    type: "start",
    id: jobId,
    asset: args.asset,
    subject: args.subject,
    settings,
    prompt,
    count,
    now: startedAt,
  });

  if (intent.needsReference && !args.reference) {
    for (let i = 0; i < count; i += 1) {
      args.dispatch({
        type: "fail",
        candidateId: `${jobId}-c${i + 1}`,
        error: "No reference image was available for this intent.",
      });
    }
    return;
  }

  const finish = async (candidateId: string, src: string, perSettings: StudioSettings) => {
    try {
      const composed = await args.deps.compose(src, perSettings);
      args.dispatch({
        type: "frame",
        candidateId,
        url: composed.dataUrl,
        final: true,
      });
      args.dispatch({
        type: "meta",
        candidateId,
        width: composed.width,
        height: composed.height,
        bytes: composed.bytes,
        ...(composed.alpha ? { alpha: composed.alpha } : {}),
      });
    } catch (err) {
      args.dispatch({
        type: "fail",
        candidateId,
        error: err instanceof Error ? err.message : "Could not finish this render",
      });
    }
  };

  // Local-only passes: reuse the current pixels, no model call.
  if (!intent.generates) {
    await finish(`${jobId}-c1`, args.reference!, settings);
    return;
  }

  const base = Math.floor(random() * 100000);
  await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const candidateId = `${jobId}-c${i + 1}`;
      const perSettings = candidateSettings(settings, i, base);
      try {
        let last: string | null = null;
        await args.deps.generate({
          prompt: buildStudioPrompt(args.subject, perSettings),
          model: perSettings.model,
          ...(intent.needsReference && args.reference ? { reference: args.reference } : {}),
          signal: args.signal,
          onFrame: (url, isFinal) => {
            last = url;
            if (!isFinal) args.dispatch({ type: "frame", candidateId, url, final: false });
          },
        });
        if (args.signal.aborted) return;
        if (!last) throw new Error("The model returned no image");
        await finish(candidateId, last, perSettings);
      } catch (err) {
        if (args.signal.aborted) return;
        args.dispatch({
          type: "fail",
          candidateId,
          error:
            err instanceof Error
              ? err.message
              : "Generation failed for this candidate",
        });
      }
    }),
  );
}

/** Convenience for tests and previews: run the reducer over a list of actions. */
export function applyActions(actions: readonly JobAction[]): Job | null {
  return actions.reduce<Job | null>((job, action) => jobReducer(job, action), null);
}
