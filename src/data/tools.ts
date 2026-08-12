export interface DuckTool {
  slug: string;
  name: string;
  summary: string;
  status: "live" | "planned";
  to?: string;
  useCase: string;
}

export const TOOLS: DuckTool[] = [
  {
    slug: "duck-cooking-time-calculator",
    name: "Duck Cooking-Time Calculator",
    summary:
      "Enter cut, weight, and oven temperature to get a working time estimate plus the temperature to check for.",
    status: "planned",
    useCase: "Planning dinner timing",
  },
  {
    slug: "duck-doneness-guide",
    name: "Duck Doneness Guide",
    summary:
      "Internal temperature ranges for breast and legs, what each range looks like, and when to pull and rest.",
    status: "planned",
    useCase: "Cooking with a thermometer",
  },
  {
    slug: "whole-duck-serving-calculator",
    name: "Whole-Duck Serving Calculator",
    summary:
      "Work out how many whole ducks to buy for your table, based on guest count, appetite, and leftovers.",
    status: "live",
    to: "/tools/whole-duck-serving-calculator",
    useCase: "Shopping for a dinner party",
  },
  {
    slug: "duck-fat-substitution-calculator",
    name: "Duck-Fat Substitution Calculator",
    summary:
      "Convert between duck fat, butter, and neutral oil by weight and volume for roasting and confit.",
    status: "planned",
    useCase: "Adapting a recipe",
  },
];
