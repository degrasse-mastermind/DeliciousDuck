import { useId, useMemo, useState } from "react";
import { X } from "lucide-react";

interface Ingredient {
  id: string;
  quantity: string;
  unit: string;
  name: string;
}

const WEIGHT_UNITS = new Set(["g", "kg", "oz", "lb"]);

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `ing-${idCounter}`;
}

const SEED_INGREDIENTS: Ingredient[] = [
  { id: nextId(), quantity: "2", unit: "", name: "duck breasts, skin on" },
  { id: nextId(), quantity: "1/2", unit: "tsp", name: "salt" },
  { id: nextId(), quantity: "1/4", unit: "tsp", name: "black pepper" },
  { id: nextId(), quantity: "1", unit: "cup", name: "pitted cherries, halved" },
  { id: nextId(), quantity: "1/2", unit: "cup", name: "red wine or stock" },
  { id: nextId(), quantity: "1 1/2", unit: "tbsp", name: "red wine vinegar" },
  { id: nextId(), quantity: "1", unit: "tbsp", name: "honey" },
  { id: nextId(), quantity: "1", unit: "tbsp", name: "butter, cold, cubed" },
  { id: nextId(), quantity: "200", unit: "g", name: "cherries, for garnish" },
];

/** Parses "1 1/2", "3/4", "0.5", "2" into a decimal. Returns null if unparseable. */
function parseQuantity(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const [, whole, num, den] = mixedMatch;
    const d = Number(den);
    if (!d) return null;
    return Number(whole) + Number(num) / d;
  }
  const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const [, num, den] = fracMatch;
    const d = Number(den);
    if (!d) return null;
    return Number(num) / d;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** Renders a decimal as a clean fraction to the nearest 1/8, or a rounded decimal. */
function formatScaled(value: number, unit: string): string {
  if (WEIGHT_UNITS.has(unit.toLowerCase())) {
    // Round grams/oz-style weights to sensible whole numbers.
    if (value < 10) return (Math.round(value * 10) / 10).toString();
    return Math.round(value).toString();
  }

  const whole = Math.floor(value);
  const remainder = value - whole;
  const eighths = Math.round(remainder * 8);

  if (eighths === 0) return whole.toString() || "0";
  if (eighths === 8) return (whole + 1).toString();

  const fractionMap: Record<number, string> = {
    1: "1/8",
    2: "1/4",
    3: "3/8",
    4: "1/2",
    5: "5/8",
    6: "3/4",
    7: "7/8",
  };
  const fraction = fractionMap[eighths] ?? "";
  return whole > 0 ? `${whole} ${fraction}` : fraction;
}

export function RecipeScaler() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(SEED_INGREDIENTS);
  const [originalServings, setOriginalServings] = useState("2");
  const [desiredServings, setDesiredServings] = useState("4");
  const headingId = useId();

  const factor = useMemo(() => {
    const o = Number(originalServings);
    const d = Number(desiredServings);
    if (!Number.isFinite(o) || !Number.isFinite(d) || o <= 0 || d <= 0) return null;
    return d / o;
  }, [originalServings, desiredServings]);

  function updateIngredient(id: string, patch: Partial<Ingredient>) {
    setIngredients((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setIngredients((rows) => [...rows, { id: nextId(), quantity: "", unit: "", name: "" }]);
  }

  function removeRow(id: string) {
    setIngredients((rows) => rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 rounded-sm border border-border bg-card p-6 lg:p-8">
        <div>
          <label
            htmlFor="original-servings"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Original servings
          </label>
          <input
            id="original-servings"
            type="number"
            min={1}
            value={originalServings}
            onChange={(e) => setOriginalServings(e.target.value)}
            className="mt-2 h-12 w-full rounded-sm border border-input bg-background px-3 text-base"
          />
        </div>
        <div>
          <label
            htmlFor="desired-servings"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Desired servings
          </label>
          <input
            id="desired-servings"
            type="number"
            min={1}
            value={desiredServings}
            onChange={(e) => setDesiredServings(e.target.value)}
            className="mt-2 h-12 w-full rounded-sm border border-input bg-background px-3 text-base"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">Ingredient list, editable</caption>
          <thead>
            <tr className="border-b border-border bg-cream">
              <th scope="col" className="px-3 py-3 font-semibold text-foreground">
                Quantity
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-foreground">
                Unit
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-foreground">
                Ingredient
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-foreground" aria-live="polite">
                Scaled
              </th>
              <th scope="col" className="px-3 py-3 text-right">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((row, i) => {
              const qty = parseQuantity(row.quantity);
              const scaled = qty != null && factor != null ? qty * factor : null;
              return (
                <tr key={row.id} className="border-b border-border align-top">
                  <td className="px-3 py-2">
                    <label className="sr-only" htmlFor={`qty-${row.id}`}>
                      Quantity for ingredient row {i + 1}
                    </label>
                    <input
                      id={`qty-${row.id}`}
                      type="text"
                      value={row.quantity}
                      placeholder="1 1/2"
                      onChange={(e) => updateIngredient(row.id, { quantity: e.target.value })}
                      className="h-10 w-24 rounded-sm border border-input bg-background px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <label className="sr-only" htmlFor={`unit-${row.id}`}>
                      Unit for ingredient row {i + 1}
                    </label>
                    <input
                      id={`unit-${row.id}`}
                      type="text"
                      value={row.unit}
                      placeholder="tbsp"
                      onChange={(e) => updateIngredient(row.id, { unit: e.target.value })}
                      className="h-10 w-20 rounded-sm border border-input bg-background px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <label className="sr-only" htmlFor={`name-${row.id}`}>
                      Ingredient name for row {i + 1}
                    </label>
                    <input
                      id={`name-${row.id}`}
                      type="text"
                      value={row.name}
                      placeholder="ingredient"
                      onChange={(e) => updateIngredient(row.id, { name: e.target.value })}
                      className="h-10 w-full min-w-[10rem] rounded-sm border border-input bg-background px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-foreground">
                    {scaled != null
                      ? `${formatScaled(scaled, row.unit)} ${row.unit}`.trim()
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      aria-label={`Remove ${row.name || "ingredient"} row`}
                      className="rounded-sm p-2 text-muted-foreground hover:text-destructive"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="rounded-sm border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary"
      >
        Add ingredient
      </button>

      <p id={headingId} className="text-sm leading-relaxed text-muted-foreground">
        This ingredient list is a generic pan-seared duck breast with cherry pan sauce, provided as
        a starting example — it is not a tested DeliciousDuck recipe. Volumes scale to the nearest
        useful eighth of a unit; weights round to whole grams. Cooking time, seasoning intensity,
        and pan size do not scale linearly with quantity, so taste and adjust as you go, especially
        above 2–3x the original batch.
      </p>
    </div>
  );
}
