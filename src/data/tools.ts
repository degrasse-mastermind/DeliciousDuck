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
    slug: "duck-cooking-time-planner",
    name: "Duck Cooking-Time Planner",
    summary:
      "Enter whole-duck weight and oven temperature to get a planning range — then verify the finish with a thermometer.",
    status: "live",
    to: "/tools/duck-cooking-time-planner",
    useCase: "Planning dinner timing",
  },
  {
    slug: "duck-doneness-guide",
    name: "Interactive Duck Doneness Guide",
    summary:
      "Pick a cut, method, and the result you want. See probe placement, carryover, rest time, and the USDA safety recommendation side by side.",
    status: "live",
    to: "/tools/duck-doneness-guide",
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
      "Convert butter, oil, or lard quantities into a practical duck-fat amount across tablespoons, cups, and grams.",
    status: "live",
    to: "/tools/duck-fat-substitution-calculator",
    useCase: "Adapting a recipe",
  },
  {
    slug: "recipe-scaler",
    name: "Recipe Scaler",
    summary:
      "Scale an ingredient list from its original servings to the number you're actually cooking for, fractions handled cleanly.",
    status: "live",
    to: "/tools/recipe-scaler",
    useCase: "Cooking for a different crowd",
  },
  {
    slug: "what-should-i-cook",
    name: "What Should I Do With This Duck?",
    summary:
      "Answer five questions about the duck in front of you and get one to three method recommendations with links to the technique guides.",
    status: "live",
    to: "/tools/what-should-i-cook",
    useCase: "Deciding what to make tonight",
  },
];
