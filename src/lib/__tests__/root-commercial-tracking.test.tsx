// @vitest-environment happy-dom
import { StrictMode, type ComponentType } from "react";
import { cleanup, render } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCommercialPageViewDedupe } from "@/lib/analytics";
import { resetPostHogStateForTests } from "@/lib/posthog";

// Exercise the real root effect and tracking helpers; only the SDK transport,
// router state and unrelated page chrome are replaced. No live tags are loaded.
const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  set_config: vi.fn(),
  stopSessionRecording: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: sdk }));
const routeState = vi.hoisted(() => ({ pathname: "/" }));
const queryClient = new QueryClient();
vi.mock("@tanstack/react-router", () => ({
  createRootRouteWithContext: () => (options: object) => ({
    options,
    useRouteContext: () => ({ queryClient }),
  }),
  useRouterState: () => routeState.pathname,
  useRouter: () => ({}),
  Outlet: () => null,
  Link: () => null,
  HeadContent: () => null,
  Scripts: () => null,
}));
vi.mock("@/components/site/Header", () => ({ Header: () => null }));
vi.mock("@/components/site/Footer", () => ({ Footer: () => null }));
const { Route } = await import("@/routes/__root");
const Root = Route.options.component as ComponentType;
const BUY = "/buy/where-to-buy-duck-online";
const GEAR = "/gear/best-roasting-pan-for-duck";
const EDITORIAL = "/recipes";
const gtag = vi.fn();

function locate(path: string, host = "deliciousduck.com", search = "") {
  window.location.href = `https://${host}${path}${search}`;
  routeState.pathname = path;
}

function commercialPaths() {
  return sdk.capture.mock.calls
    .filter(([event]) => event === "commercial_page_view")
    .map(([, properties]) => properties.page_path);
}

function pageViewPaths() {
  return sdk.capture.mock.calls
    .filter(([event]) => event === "$pageview")
    .map(([, properties]) => properties.$pathname);
}

beforeEach(() => {
  vi.clearAllMocks();
  resetPostHogStateForTests();
  resetCommercialPageViewDedupe();
  locate(BUY);
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.gtag = gtag;
  window.dataLayer = [];
});

afterEach(() => {
  cleanup();
  delete window.gtag;
});

describe("root commercial visit tracking", () => {
  it("captures a fresh commercial landing in both transports with path-only properties", () => {
    locate(BUY, "deliciousduck.com", "?private=never-send#fragment");
    render(<Root />);
    expect(commercialPaths()).toEqual([BUY]);
    expect(sdk.capture).toHaveBeenCalledWith("commercial_page_view", {
      page_path: BUY,
      source_path: BUY,
      content_type: "buy_duck",
      content_slug: "where-to-buy-duck-online",
      commercial_surface: "buying_guides",
    });
    expect(gtag.mock.calls.filter(([, name]) => name === "commercial_page_view")).toHaveLength(1);
    expect(pageViewPaths()).toEqual([BUY]);
    expect(sdk.init).toHaveBeenCalledTimes(1);
  });

  it("suppresses duplicate commercial events during StrictMode effect replay", () => {
    const view = render(
      <StrictMode>
        <Root />
      </StrictMode>,
    );
    view.rerender(
      <StrictMode>
        <Root />
      </StrictMode>,
    );
    expect(commercialPaths()).toEqual([BUY]);
    expect(gtag.mock.calls.filter(([, name]) => name === "commercial_page_view")).toHaveLength(1);
    expect(sdk.init).toHaveBeenCalledTimes(1);
    // Existing manual pageview behavior is intentionally unchanged by this fix.
    expect(pageViewPaths()).toEqual([BUY, BUY]);
  });

  it("counts editorial-to-commercial navigation without an editorial commercial event", () => {
    locate(EDITORIAL);
    const view = render(<Root />);
    expect(commercialPaths()).toEqual([]);
    locate(BUY);
    view.rerender(<Root />);
    expect(commercialPaths()).toEqual([BUY]);
    expect(pageViewPaths()).toEqual([EDITORIAL, BUY]);
    expect(sdk.init).toHaveBeenCalledTimes(1);
  });

  it.each([GEAR, EDITORIAL])("counts A to %s to A as two visits to A", (middle) => {
    const view = render(<Root />);
    locate(middle);
    view.rerender(<Root />);
    locate(BUY);
    view.rerender(<Root />);
    expect(commercialPaths()).toEqual(middle === GEAR ? [BUY, GEAR, BUY] : [BUY, BUY]);
    expect(pageViewPaths()).toEqual([BUY, middle, BUY]);
  });

  it.each(["/internal/growth-dashboard", "/api/test"])(
    "stays silent on %s then tracks its first public visit",
    (blocked) => {
      locate(blocked);
      const view = render(<Root />);
      expect(sdk.init).not.toHaveBeenCalled();
      expect(sdk.capture).not.toHaveBeenCalled();
      expect(gtag).not.toHaveBeenCalled();
      locate(BUY);
      view.rerender(<Root />);
      expect(commercialPaths()).toEqual([BUY]);
      expect(pageViewPaths()).toEqual([BUY]);
    },
  );

  it.each(["preview.lovable.app", "localhost"])("excludes commercial traffic on %s", (host) => {
    locate(BUY, host);
    render(<Root />);
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.capture).not.toHaveBeenCalled();
    expect(gtag).not.toHaveBeenCalled();
  });

  it.each(["stored", "query"])("excludes %s QA traffic before initialization", (source) => {
    if (source === "stored") window.localStorage.setItem("dd_analytics_optout", "1");
    else locate(BUY, "deliciousduck.com", "?dd_qa=1");
    const view = render(<Root />);
    locate(GEAR);
    view.rerender(<Root />);
    expect(window.localStorage.getItem("dd_analytics_optout")).toBe("1");
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.capture).not.toHaveBeenCalled();
    expect(gtag).not.toHaveBeenCalled();
  });
});
