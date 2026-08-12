import { useState } from "react";
import { Check } from "lucide-react";

/**
 * Client-side only for v1: validates and shows a success state.
 * `onSubscribe` is the seam where a Resend-backed server function is wired in.
 */
export function NewsletterSignup({
  id = "starter-guide",
  onSubscribe,
}: {
  id?: string;
  onSubscribe?: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const valid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await onSubscribe?.(email.trim());
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 overflow-hidden rounded-sm bg-forest text-forest-foreground"
    >
      <div className="grid gap-10 p-8 lg:grid-cols-2 lg:items-center lg:p-14">
        <div>
          <span className="eyebrow text-accent">Free download</span>
          <h2
            id={`${id}-heading`}
            className="mt-3 font-display text-3xl leading-tight lg:text-[2.75rem]"
          >
            The Duck Cooking Starter Guide
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-forest-foreground/80">
            A concise PDF covering the four duck cuts, target internal temperatures, how to render
            a fat cap properly, and what to buy first. Written for home cooks making duck for the
            first time.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-forest-foreground/80">
            {[
              "Temperature targets for breast, legs, and whole birds",
              "A one-page shopping checklist",
              "The three mistakes that make duck tough",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sm bg-background/95 p-6 text-foreground lg:p-8">
          {done ? (
            <div role="status" className="text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary"
              >
                <Check className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-2xl">You're on the list</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Check your inbox for the Duck Cooking Starter Guide. Email delivery is being
                connected — you'll receive it as soon as it goes live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor={`${id}-email`}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
                >
                  Email address
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  placeholder="you@example.com"
                  className="mt-2 h-12 w-full rounded-sm border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground"
                />
                {error && (
                  <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={pending}
                className="h-12 w-full rounded-sm bg-primary text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-forest-deep disabled:opacity-70"
              >
                {pending ? "Sending…" : "Send me the guide"}
              </button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                One email with the guide, then occasional recipes and gear notes. Unsubscribe any
                time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
