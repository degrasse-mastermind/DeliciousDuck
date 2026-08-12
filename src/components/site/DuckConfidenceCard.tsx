import { ChefHat } from "lucide-react";

/**
 * Duck Confidence Card — the at-a-glance orientation block for a technique page.
 */
export interface DuckConfidence {
  cut: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  biggestRisk: string;
  essentialTechnique: string;
  targetResult: string;
  essentialTool: string;
  saveAfterwards: string;
}

const ROWS: { key: keyof DuckConfidence; label: string }[] = [
  { key: "cut", label: "Cut" },
  { key: "difficulty", label: "Difficulty" },
  { key: "biggestRisk", label: "Biggest risk" },
  { key: "essentialTechnique", label: "Essential technique" },
  { key: "targetResult", label: "Target result" },
  { key: "essentialTool", label: "Essential tool" },
  { key: "saveAfterwards", label: "Save afterwards" },
];

export function DuckConfidenceCard({ data }: { data: DuckConfidence }) {
  return (
    <section
      aria-labelledby="confidence-card"
      className="rounded-sm border border-primary/20 bg-cream p-6 lg:p-7"
    >
      <div className="flex items-center gap-2.5">
        <ChefHat aria-hidden="true" className="size-4 text-primary" />
        <h2 id="confidence-card" className="eyebrow text-primary">
          Duck Confidence Card
        </h2>
      </div>
      <dl className="mt-5 divide-y divide-border">
        {ROWS.map((row) => (
          <div key={row.key} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {row.label}
            </dt>
            <dd className="text-sm leading-relaxed text-foreground/90">{data[row.key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
