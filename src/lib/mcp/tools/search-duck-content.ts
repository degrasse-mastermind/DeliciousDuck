import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { searchContent } from "../content";

export default defineTool({
  name: "search_duck_content",
  title: "Search DeliciousDuck content",
  description:
    "Search DeliciousDuck's published recipes, cooking guides, ingredient pages, and calculators. Returns titles, one-line summaries, and canonical URLs.",
  inputSchema: {
    query: z.string().trim().min(2).describe("What to search for, e.g. 'crispy duck breast skin'."),
    limit: z.number().int().min(1).max(25).optional().describe("Maximum results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, limit }) => {
    const results = searchContent(query, limit ?? 10);
    const text = results.length
      ? results
          .map((r) => `- [${r.kind}] ${r.title} — ${r.summary} (${r.url})`)
          .join("\n")
      : `No published DeliciousDuck page matches "${query}".`;

    return { content: [{ type: "text", text }], structuredContent: { results } };
  },
});
