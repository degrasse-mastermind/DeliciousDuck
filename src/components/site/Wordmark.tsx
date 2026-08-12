export function Wordmark({ tone = "ink" }: { tone?: "ink" | "light" }) {
  const main = tone === "light" ? "text-forest-foreground" : "text-foreground";
  return (
    <span className="flex items-center gap-2">
      <img
        src="/favicon.png"
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0"
        aria-hidden="true"
      />
      <span className={`font-display text-2xl leading-none tracking-tight lg:text-[1.75rem] ${main}`}>
        Delicious<span className="text-accent">Duck</span>
      </span>
    </span>
  );
}
