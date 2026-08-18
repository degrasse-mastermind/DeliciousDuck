import { Link } from "@tanstack/react-router";
import { FOOTER_COLUMNS, LEGAL_LINKS, SITE } from "@/data/site";
import { Wordmark } from "./Wordmark";
import { AMAZON_REQUIRED_STATEMENT } from "@/data/amazon";

export function Footer() {
  return (
    <footer className="mt-24 bg-forest-deep text-forest-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2.8fr]">
          <div>
            <Wordmark tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-forest-foreground/70">
              {SITE.description}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="eyebrow text-accent">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-forest-foreground/75 transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-forest-foreground/15 pt-6 text-xs text-forest-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p>
              © {new Date().getFullYear()} {SITE.domain}. All rights reserved.
            </p>
            <p className="max-w-md">
              Some links on this site are affiliate links. {AMAZON_REQUIRED_STATEMENT}{" "}
              <Link
                to="/affiliate-disclosure"
                className="underline underline-offset-4 transition-colors hover:text-accent"
              >
                Affiliate disclosure
              </Link>
              .
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
