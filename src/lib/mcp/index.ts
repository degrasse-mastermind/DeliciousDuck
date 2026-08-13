import { defineMcp } from "@lovable.dev/mcp-js";
import searchDuckContent from "./tools/search-duck-content";
import getDuckRecipe from "./tools/get-duck-recipe";
import listDuckContent from "./tools/list-duck-content";

export default defineMcp({
  name: "deliciousduck-hub",
  title: "DeliciousDuck Hub",
  version: "0.1.0",
  instructions:
    "Tools for DeliciousDuck.com, an editorial authority site about buying, preparing, and cooking duck. Use `search_duck_content` to find relevant pages, `list_duck_content` to browse everything (including recipe slugs), and `get_duck_recipe` for a full recipe with ingredients, steps, temperatures, and troubleshooting. Recipes marked verification: editorialDraft follow established technique and published safety guidance but have not been cooked in the DeliciousDuck kitchen — never describe them as tested. Always cite the returned canonical URL.",
  tools: [searchDuckContent, listDuckContent, getDuckRecipe] as unknown as Parameters<
    typeof defineMcp
  >[0]["tools"],
});
