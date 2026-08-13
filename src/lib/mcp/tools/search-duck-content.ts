import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { searchContent } from "../content";

export default defineTool({
  name: "search_duck_content",
  title: "Search duck content",
  description:
    "Search DeliciousDuck's published recipes, cooking guides, ingredient pages, and calculators. Returns titles, one-line summaries, and canonical URLs.",
  inputSchema: {
    query: z.string().describe("What to look for, e.g. 'crispy skin' or 'duck fat substitute'."),
    kind: z
      .enum(["recipe", "guide", "ingredient", "tool"])
      .optional()
      .describe("Restrict results to one content type."),
    limit: z.number().int().optional().describe("Max results to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, kind, limit }) => {
    const max = Math.min(Math.max(limit ?? 10, 1), 25);
    const results = searchContent(query, kind, max);
    return {
      content: [
        {
          type: "text",
          text:
            results.length === 0
              ? `No DeliciousDuck content matched "${query}".`
              : results
                  .map((r) => `- [${r.kind}] ${r.title} — ${r.summary}\n  ${r.url}`)
                  .join("\n"),
        },
      ],
      structuredContent: { results },
    };
  },
});
