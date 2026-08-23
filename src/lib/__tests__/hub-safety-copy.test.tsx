// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...rest }: { to: string; children?: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));
import { readFileSync, existsSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";

afterEach(() => cleanup());
import { HubOrientation } from "@/components/site/HubOrientation";
import { SourceNotes } from "@/components/site/SourceNotes";
import { SOURCES } from "@/data/sources";

const HUBS = [
  "src/routes/learn.index.tsx",
  "src/routes/cook.index.tsx",
  "src/routes/gear.index.tsx",
  "src/routes/recipes.index.tsx",
] as const;

const read = (p: string) => readFileSync(p, "utf8");

describe("HubOrientation heading hierarchy", () => {
  it("renders the block heading as an H2 and each optional section as an H3", () => {
    render(
      <HubOrientation
        heading="Orientation heading"
        paragraphs={["Intro paragraph for the hub orientation block."]}
        sections={[
          {
            heading: "First subsection",
            paragraphs: ["Subsection prose."],
            links: [{ label: "Doneness guide", to: "/tools/duck-doneness-guide" }],
          },
          { heading: "Second subsection", paragraphs: ["More prose."] },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Orientation heading" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "First subsection" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "Second subsection" })).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 2, name: "First subsection" })).toBeNull();
  });

  it("exposes optional section links inside a labelled navigation region", () => {
    render(
      <HubOrientation
        heading="Orientation heading"
        paragraphs={["Intro paragraph."]}
        sections={[
          {
            heading: "First subsection",
            paragraphs: ["Subsection prose."],
            links: [{ label: "Doneness guide", to: "/tools/duck-doneness-guide" }],
          },
        ]}
      />,
    );

    const nav = screen.getByRole("navigation", { name: /go deeper: first subsection/i });
    expect(nav.querySelectorAll("a").length).toBe(1);
  });
});

describe("hub food-safety copy", () => {
  it("never reverses the 130–135°F / 165°F relationship", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      expect(text).not.toMatch(/130[–-]135°F[^.]*above[^.]*165°F/i);
      expect(text).not.toMatch(/above the 165°F/i);
    }
  });

  it("never equates serving duck below 165°F with rare beef", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      expect(text).not.toMatch(/rare beef/i);
      expect(text).not.toMatch(/same tradeoff people make with rare/i);
      expect(text).not.toMatch(/both are correct/i);
    }
  });

  it("states the USDA 165°F safe minimum wherever the pink window appears", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      if (/130[–-]135°F/.test(text)) {
        expect(text).toMatch(/165°F/);
        expect(text).toMatch(/USDA/);
        expect(text).toMatch(
          /depart|below (that|the) (guidance|recommend)|against that (guidance|recommendation)/i,
        );
      }
    }
  });

  it("does not recommend wild duck rare or medium-rare without qualification", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      expect(text).not.toMatch(/serve it rare to medium-rare/i);
      expect(text).not.toMatch(/own fast, rare treatment/i);
    }
  });

  it("keeps one defensible whole-duck serving baseline", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      expect(text).not.toMatch(/whole duck for four to six/i);
      if (/whole duck for/.test(text)) expect(text).toMatch(/three to four/);
    }
  });

  it("does not claim rendered duck fat keeps for months", () => {
    for (const hub of HUBS) {
      expect(read(hub)).not.toMatch(/(keeps|holds) for months/i);
    }
  });

  it("never claims cooking to 165°F removes or eliminates the risk", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      expect(text).not.toMatch(/risk that cooking to 165°F (removes|eliminates)/i);
      expect(text).not.toMatch(/(removes|eliminates|erases) (all |the )?(food-safety )?risk/i);
      expect(text).not.toMatch(/risk[- ]free/i);
    }
  });

  it("does not offer reputable sourcing as a mitigation for cooking below the minimum", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      expect(text).not.toMatch(/source you trust/i);
      expect(text).not.toMatch(/(reputable|trusted) (source|supplier|farm)/i);
    }
  });

  it("keeps the vulnerable-population warning next to the pink-breast convention", () => {
    const learn = read("src/routes/learn.index.tsx");
    expect(learn).toMatch(/carries greater food-safety risk than cooking to the USDA-recommended minimum/);
    expect(learn).toMatch(/young children, older adults, pregnant people, (or|and) anyone immunocompromised/);
  });

  it("does not use smell as a safety test or an unsupported fat storage duration", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      expect(text).not.toMatch(/smell it/i);
      expect(text).not.toMatch(/judge it by smell/i);
      expect(text).not.toMatch(/rather than (trusting )?a date/i);
      expect(text).not.toMatch(/well beyond a few weeks/i);
    }
  });

  it("uses the conservative rendered-fat storage wording where fat storage is discussed", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      if (!/rendered fat|the fat itself|rendered spoonful/i.test(text)) continue;
      expect(text).toMatch(/refrigerate it promptly/i);
      expect(text).toMatch(/freeze it for longer storage/i);
      expect(text).toMatch(/signs of spoilage/i);
    }
  });

  it("avoids unsupported absolutes about non-stick pans", () => {
    const gear = read("src/routes/gear.index.tsx");
    expect(gear).not.toMatch(/weakest option/i);
    expect(gear).not.toMatch(/cannot take the heat a fat cap needs/i);
  });
});

describe("hub safety sourcing", () => {
  const USDA_URLS = [
    "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/duck-and-goose-farm-table",
    "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart",
    "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/big-thaw-safe-defrosting-methods",
  ];

  it("registers the primary USDA temperature, duck and thawing references", () => {
    const urls = Object.values(SOURCES).map((s) => s.url);
    for (const url of USDA_URLS) expect(urls).toContain(url);
  });

  it("renders visible source notes on every hub that discusses safety temperatures", () => {
    for (const hub of HUBS) {
      const text = read(hub);
      if (!/165°F/.test(text)) continue;
      expect(text).toMatch(/<SourceNotes/);
      expect(text).toMatch(/usdaPoultryTemp/);
    }
  });

  it("gives the learn hub the temperature, duck, thawing and storage references", () => {
    const learn = read("src/routes/learn.index.tsx");
    for (const id of ["usdaPoultryTemp", "usdaPoultryPrep", "usdaThawing", "fdaColdStorage"]) {
      expect(learn).toContain(id);
    }
  });

  it("renders source links as real anchors", () => {
    render(<SourceNotesFixture />);
    const link = screen.getByRole("link", { name: SOURCES["usdaPoultryTemp"]!.label });
    expect(link.getAttribute("href")).toBe(SOURCES["usdaPoultryTemp"]!.url);
  });
});

describe("hub orientation internal links", () => {
  const routeFileFor = (path: string) => {
    const segments = path.replace(/^\//, "").split("/");
    const base = segments.join(".");
    return [
      `src/routes/${base}.tsx`,
      `src/routes/${base}/index.tsx`,
      `src/routes/${base}.index.tsx`,
    ];
  };

  it("points every new hub subsection link at an existing route file", () => {
    const targets = new Set<string>();
    for (const hub of HUBS) {
      for (const m of read(hub).matchAll(/\{ label: "[^"]+", to: "(\/[a-z0-9\-/]+)" \}/g)) {
        targets.add(m[1]!);
      }
    }
    expect(targets.size).toBeGreaterThan(15);
    const missing = [...targets].filter((t) => !routeFileFor(t).some((f) => existsSync(f)));
    expect(missing).toEqual([]);
  });
});

function SourceNotesFixture() {
  return <SourceNotes ids={["usdaPoultryTemp"]} />;
}
