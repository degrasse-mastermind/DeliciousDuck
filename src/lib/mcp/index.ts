import { defineMcp } from "@lovable.dev/mcp-js";

import getDuckRecipe from "./tools/get-duck-recipe";
import listDuckContent from "./tools/list-duck-content";
import searchDuckContent from "./tools/search-duck-content";

export default defineMcp({
  name: "deliciousduck-hub",
  title: "DeliciousDuck Hub",
  version: "0.1.0",
  instructions:
    "Tools for DeliciousDuck, a duck cooking and buying authority site. Use `search_duck_content` to find published recipes, guides, ingredient pages, and calculators; `list_duck_content` to browse everything with canonical URLs; and `get_duck_recipe` to read one recipe in full, including method, temperatures, and troubleshooting. All content is already public on deliciousduck.com. Keep temperature and food-safety wording exactly as returned.",
  tools: [searchDuckContent, listDuckContent, getDuckRecipe],
});
