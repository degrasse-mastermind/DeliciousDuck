import { Link } from "@tanstack/react-router";
import { ArrowRight, Calculator } from "lucide-react";
import type { DuckTool } from "@/data/tools";

export function ToolListItem({ tool }: { tool: DuckTool }) {
  const live = tool.status === "live" && tool.to;

  const body = (
    <>
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary"
      >
        <Calculator className="size-5" />
      </span>
      <span className="flex-1">
        <span className="flex flex-wrap items-center gap-3">
          <span className="font-display text-xl text-foreground">{tool.name}</span>
          {live ? (
            <span className="eyebrow rounded-full bg-accent/20 px-2.5 py-1 text-[0.625rem] text-gold-foreground">
              Live
            </span>
          ) : (
            <span className="eyebrow rounded-full bg-muted px-2.5 py-1 text-[0.625rem] text-muted-foreground">
              In development
            </span>
          )}
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
          {tool.summary}
        </span>
        <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
          Best for: {tool.useCase}
        </span>
      </span>
      {live && (
        <ArrowRight
          aria-hidden="true"
          className="mt-3 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (live) {
    return (
      <li>
        <Link
          to={tool.to!}
          className="group flex gap-4 border-b border-border py-6 transition-colors hover:bg-cream/60"
        >
          {body}
        </Link>
      </li>
    );
  }

  return <li className="flex gap-4 border-b border-border py-6 opacity-90">{body}</li>;
}
