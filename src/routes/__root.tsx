import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, createElement, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  GA_MEASUREMENT_ID,
  trackCommercialPageView,
  trackEmailLanding,
  trackPageView,
} from "@/lib/analytics";
import { capturePostHogPageView, initPostHog } from "@/lib/posthog";

function gtagInitScript(measurementId: string) {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      // Strip query strings from the automatic first page_view: mailbox-token
      // links (/newsletter/unsubscribe?t=...) must never reach analytics.
      page_location: window.location.origin + window.location.pathname,
      page_path: window.location.pathname
    });
  `;
}


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DeliciousDuck — Duck Recipes, Guides, Gear & Cooking Tools" },
      {
        name: "description",
        content:
          "Expert duck recipes, step-by-step guides, buying advice, gear reviews, and practical cooking tools.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "DeliciousDuck" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0c2c1b" },
      {
        name: "impact-site-verification",
        value: "abefd171-51cd-42ed-9d74-b04a6b10ce75",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Inter:wght@400;500;600;700&display=swap",
      },
      // Transparent PNG marks for browser tabs and bookmarks — they sit on
      // light or dark browser chrome, so the green tile must not carry a
      // background of its own.
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      // Solid green tile — iOS composites home-screen icons onto the
      // wallpaper and ignores alpha, so this variant is pre-flattened.
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {createElement("meta", {
          name: "impact-site-verification",
          value: "0a7d07f1-b741-4412-8973-aefb551b0262",
        } as any)}
        {/* Google Analytics 4 — loaded once globally for every route */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: gtagInitScript(GA_MEASUREMENT_ID),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // gtag.js auto-tracks only the first load; send a page_view per SPA route.
  const firstView = useRef(true);
  // PostHog: initialize once at startup, alongside (never replacing) GA4.
  useEffect(() => {
    initPostHog();
  }, []);
  useEffect(() => {
    // Campaign-level newsletter attribution for this session (no PII).
    trackEmailLanding();
    // One `commercial_page_view` per navigation that enters a commercial
    // route. The helper suppresses effect replay for the same navigation, so
    // A -> B -> A still counts twice for A, and non-commercial routes emit
    // nothing.

    trackCommercialPageView({ path: pathname });
    // Manual PostHog pageview per navigation, including the first load.
    capturePostHogPageView(pathname);
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    trackPageView(pathname, typeof document !== "undefined" ? document.title : undefined);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

