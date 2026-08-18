import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { NAV_LINKS } from "@/data/site";
import { Wordmark } from "./Wordmark";
import { CTA } from "@/lib/cta";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 lg:h-20 lg:px-8">
        <Link
          to="/"
          className="mr-auto shrink-0 rounded-sm"
          aria-label="DeliciousDuck home"
        >
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="eyebrow text-foreground/70 transition-colors hover:text-primary"
                  activeProps={{ className: "text-primary" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/about"
                className="eyebrow text-foreground/70 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                ABOUT
              </Link>
            </li>
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SearchField />
          <Link
            to="/tools"
            hash="starter-guide"
            className={CTA.primary}
          >
            Get the Free Guide
          </Link>
        </div>

        {/* Compact lead-magnet entry point for phones. The desktop header keeps
            its search field and full-width button; this one only appears below
            `lg`, sits left of the menu toggle, and clears a 44px tap target. */}
        <Link
          to="/tools"
          hash="starter-guide"
          onClick={() => setOpen(false)}
          data-mobile-guide-cta
          className={`shrink-0 px-3 ${CTA.primary} lg:hidden`}
        >
          Free Guide
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-sm border border-border text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-border bg-cream lg:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-7xl px-5 py-5">
            <ul className="grid gap-1">
              {[...NAV_LINKS, { label: "ABOUT", to: "/about" }].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-sm px-2 py-3 font-display text-xl text-foreground hover:text-primary"
                  >
                    {link.label.charAt(0) + link.label.slice(1).toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-3">
              <SearchField id="mobile-search" onSubmit={() => setOpen(false)} />
              <Link
                to="/tools"
                hash="starter-guide"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary px-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground"
              >
                Get the Free Guide
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function SearchField({ id = "site-search", onSubmit }: { id?: string; onSubmit?: () => void }) {
  return (
    <form
      role="search"
      method="get"
      action="/search"
      onSubmit={onSubmit}
      className="relative flex items-center"
    >
      <label htmlFor={id} className="sr-only">
        Search DeliciousDuck
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
      />
      <input
        id={id}
        name="q"
        type="search"
        required
        placeholder="Search duck recipes"
        className="h-10 w-full rounded-sm border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground lg:w-56"
      />
    </form>
  );
}
