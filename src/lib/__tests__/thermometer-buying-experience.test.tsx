// @vitest-environment happy-dom
import { Suspense, type ComponentType, type ReactNode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AMAZON_TAG } from "@/data/amazon";

const path = "/gear/best-thermometer-for-duck";
// Supply route context only; render the real page and commercial components.
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  createFileRoute: () => (options: object) => ({ options }),
  useLocation: () => path,
  useRouterState: () => path,
  Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

const { Route } = await import("@/routes/gear.best-thermometer-for-duck");
const Component = Route.options.component as ComponentType & { preload?: () => Promise<unknown> };
await Component.preload?.();
const Page = () => (
  <Suspense fallback={null}>
    <Component />
  </Suspense>
);
afterEach(cleanup);

describe("thermometer guide buying experience", () => {
  it("offers both researched products together before the detailed buying advice", async () => {
    render(<Page />);
    await screen.findByRole("heading", { level: 1 }, { timeout: 10000 });
    const products = [...document.querySelectorAll<HTMLAnchorElement>('a[href*="amazon.com/dp/"]')];
    expect(products).toHaveLength(2);
    const callout = products[0]!.closest("aside")!;
    expect(within(callout).getAllByRole("link", { name: /opens amazon.com/ })).toHaveLength(2);
    const advice = screen.getByRole("heading", { name: "Match the thermometer to how you cook" });
    expect(callout.compareDocumentPosition(advice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const disclosure = screen.getByLabelText("Affiliate disclosure");
    expect(
      disclosure.compareDocumentPosition(callout) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const [index, asin] of ["B07XXSYLL8", "B017613C3C"].entries()) {
      const product = products[index]!;
      const url = new URL(product.href);
      expect(url.pathname).toBe(`/dp/${asin}`);
      expect(url.searchParams.getAll("tag")).toEqual([AMAZON_TAG]);
      expect(product.rel).toBe("sponsored nofollow noopener");
    }
  });

  it("removes obsolete seller cards while retaining category education and research limits", async () => {
    const { container } = render(<Page />);
    await screen.findByRole("heading", { level: 1 }, { timeout: 10000 });
    const text = container.textContent!;
    expect(text).not.toContain("No verified seller link yet");
    expect(text).not.toContain("Details checked 2026-08");
    expect(text).not.toContain("Brand candidate");
    expect(text).toContain("Who each option is for");
    expect(text).toContain("The decision matrix");
    expect(text).toContain("not hands-on tests");
    expect(text).toContain("reviewed October 15, 2026");
    expect(text).toContain("Not for leaving in the oven");
    expect(text).toContain("no wireless remote monitoring");
    expect(screen.getByRole("heading", { name: "Selection sources" })).toBeTruthy();
  });

  it("retains safety guidance and checks beyond the single leave-in probe", async () => {
    const { container } = render(<Page />);
    await screen.findByRole("heading", { level: 1 }, { timeout: 10000 });
    const safety = screen.getByLabelText("Food safety guidance");
    expect(safety.textContent).toContain("165°F");
    expect(safety.textContent).toContain("young children");
    expect(container.textContent).toContain(
      "innermost thigh and wing and thickest breast, avoiding bone",
    );
    expect(container.textContent).toContain("Keep the TP16 display outside the oven");
  });
});
