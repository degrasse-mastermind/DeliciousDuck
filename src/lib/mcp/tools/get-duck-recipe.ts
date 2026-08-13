import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { recipeDetail, recipeSlugs } from "../content";

export default defineTool({
  name: "get_duck_recipe",
  title: "Get duck recipe",
  description:
    "Get one full DeliciousDuck recipe by slug: ingredients, equipment, step-by-step method, temperature table, troubleshooting, leftovers, and FAQ.",
  inputSchema: {
    slug: z
      .string()
      .describe("Recipe slug, e.g. 'pan-seared-duck-breast'. Use list_duck_content to find slugs."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const recipe = recipeDetail(slug.trim());
    if (!recipe) {
      throw new ToolError(
        `No recipe found for slug "${slug}". Available slugs: ${recipeSlugs().join(", ")}.`,
      );
    }
    return {
      content: [{ type: "text", text: JSON.stringify(recipe, null, 2) }],
      structuredContent: { recipe },
    };
  },
});
