/**
 * Answer-first block.
 *
 * Sits directly under the page header on question-shaped pages and answers the
 * query outright in two or three sentences before the article develops it. Same
 * editorial rule as the rest of the site: lead with the useful answer.
 *
 * The text comes from the `answer` field in the guide registry, so the block is
 * data-driven and never drifts from what the page goes on to say.
 */
export function AnswerFirst({ answer, label = "Short answer" }: { answer: string; label?: string }) {
  return (
    <div className="mb-10 rounded-sm border-l-2 border-accent bg-cream/70 px-5 py-4 lg:px-6 lg:py-5">
      <p className="eyebrow text-primary">{label}</p>
      <p className="mt-2 text-[1.0625rem] leading-[1.7] text-foreground/90">{answer}</p>
    </div>
  );
}
