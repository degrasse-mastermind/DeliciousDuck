import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { contentIndex } from "../content";

export default defineTool({
  name: "list_duck_content",
  title: "List duck content",
  description:
    "List everything published on DeliciousDuck — recipes (with slugs), guides, ingredient pages, and live calculators — with canonical URLs.",
  inputSchema: {
    kind: z
      .enum(["recipe", "guide", "ingredient", "tool"])
      .optional()
      .describe("Restrict the listing to one content type."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ kind }) => {
    const items = kind ? contentIndex().filter((i) => i.kind === kind) : contentIndex();
    return {
      content: [
        {
          type: "text",
          text: items
            .map((i) => `- [${i.kind}] ${i.title}${i.slug ? ` (slug: ${i.slug})` : ""} — ${i.url}`)
            .join("\n"),
        },
      ],
      structuredContent: { count: items.length, items },
    };
  },
});
