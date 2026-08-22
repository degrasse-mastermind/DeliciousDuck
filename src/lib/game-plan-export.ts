/**
 * Read-friendly renderings of a resolved Duck Game Plan.
 *
 * Pure formatting only: every line comes from the already-resolved plan, so no
 * temperature, timing or claim is invented here. Used by the on-page plain-text
 * view and by the download action; both share one serializer so what a visitor
 * reads on screen is exactly what lands in the file.
 */

import { SITE_URL } from "@/data/site";
import type { DuckGamePlan, PlanLink } from "@/data/duck-game-plan";

const RULE = "----------------------------------------";

/**
 * A downloaded file outlives the page it came from, so every internal path is
 * written as a canonical absolute URL. Query strings and fragments are dropped:
 * a plan file carries no parameters of any kind.
 */
export function absolutePlanUrl(href: string): string {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const bare = (trimmed.split("#")[0] ?? "").split("?")[0] ?? "";
  const path = bare.startsWith("/") ? bare : `/${bare}`;
  return `${SITE_URL}${path}`;
}

function linkLine(link: PlanLink): string {
  return `${link.label}${link.note ? ` — ${link.note}` : ""}\n  ${absolutePlanUrl(link.href)}`;
}

function section(label: string, body: string | undefined): string[] {
  return body ? [`${label.toUpperCase()}`, body, ""] : [];
}

/** Plain-text kitchen card. Wraps nothing: readers and files handle that. */
export function planToText(plan: DuckGamePlan): string {
  const lines: string[] = [
    "YOUR DUCK GAME PLAN",
    RULE,
    plan.headline,
    "",
    plan.summary,
    "",
    ...section("Biggest risk", plan.risk),
    ...section(
      "Critical move",
      plan.refinement ? `${plan.criticalMove}\n${plan.refinement}` : plan.criticalMove,
    ),
    ...section("Temperature", plan.temperature),
    ...section("Rest", plan.rest),
    ...section("Timing", plan.timing),
    ...section("Equipment", linkLine(plan.equipment)),
    ...section("How much", plan.serving),
    ...section(
      "What to serve",
      plan.pairing.length
        ? plan.pairing.map((link) => `- ${linkLine(link)}`).join("\n")
        : undefined,
    ),
    ...section("Save the fat", plan.saveTheFat),
    RULE,
    "START HERE",
    linkLine(plan.primary),
    "",
  ];

  if (plan.secondary.length) {
    lines.push("IF YOU WANT MORE DETAIL", ...plan.secondary.map((l) => `- ${linkLine(l)}`), "");
  }
  if (plan.commercial) {
    lines.push("STILL SOURCING IT", linkLine(plan.commercial), "");
  }

  lines.push("deliciousduck.com — use the URLs above to open the full guides.");
  return lines.join("\n");
}

/** Stable, PII-free filename for the downloaded plan. */
export function planFileName(plan: DuckGamePlan): string {
  const slug = plan.recommendationId.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `duck-game-plan-${slug}.txt`;
}
