import { useRef, useState } from "react";
import { Download, FileText, Printer } from "lucide-react";

import type { DuckGamePlan } from "@/data/duck-game-plan";
import { planFileName, planToText } from "@/lib/game-plan-export";

/**
 * Print / view / download actions for a rendered Duck Game Plan.
 *
 * Presentation only: nothing here changes the plan, the newsletter path, or the
 * analytics contracts. Printing isolates the plan card via the print stylesheet;
 * the plain-text view and the download share one serializer.
 */
export function GamePlanExportActions({ plan }: { plan: DuckGamePlan }) {
  const [showText, setShowText] = useState(false);
  const textRef = useRef<HTMLPreElement | null>(null);

  function handlePrint() {
    if (typeof window === "undefined") return;
    document.body.classList.add("dd-print-plan");
    const cleanup = () => document.body.classList.remove("dd-print-plan");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
    // Safari never fires afterprint reliably; clear on the next tick as well.
    window.setTimeout(cleanup, 1000);
  }

  function handleDownload() {
    if (typeof window === "undefined") return;
    const blob = new Blob([planToText(plan)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = planFileName(plan);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const buttonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 text-sm transition-colors hover:border-primary/50 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div data-print-hide className="mt-6">
      <span className="eyebrow text-muted-foreground">Take it to the kitchen</span>
      <div className="mt-2.5 flex flex-wrap gap-2.5">
        <button type="button" onClick={handlePrint} className={buttonClass}>
          <Printer aria-hidden="true" className="size-4" />
          Print plan
        </button>
        <button
          type="button"
          onClick={() => {
            setShowText((open) => !open);
            if (!showText) window.setTimeout(() => textRef.current?.focus(), 0);
          }}
          aria-expanded={showText}
          aria-controls="dd-plan-text"
          className={buttonClass}
        >
          <FileText aria-hidden="true" className="size-4" />
          {showText ? "Hide plain text" : "View as plain text"}
        </button>
        <button type="button" onClick={handleDownload} className={buttonClass}>
          <Download aria-hidden="true" className="size-4" />
          Download (.txt)
        </button>
      </div>

      {showText && (
        <pre
          id="dd-plan-text"
          ref={textRef}
          tabIndex={0}
          className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-sm border border-border bg-secondary/40 p-4 font-mono text-xs leading-relaxed text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {planToText(plan)}
        </pre>
      )}
    </div>
  );
}
