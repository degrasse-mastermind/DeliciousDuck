export function Wordmark({ tone = "ink" }: { tone?: "ink" | "light" }) {
  const main = tone === "light" ? "text-forest-foreground" : "text-foreground";
  return (
    <span className="flex items-baseline gap-1.5">
      <span className={`font-display text-2xl leading-none tracking-tight lg:text-[1.75rem] ${main}`}>
        Delicious<span className="text-accent">Duck</span>
      </span>
    </span>
  );
}
