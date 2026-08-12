import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

export function PageHeader({
  eyebrow,
  title,
  intro,
  trail,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  trail: Crumb[];
}) {
  return (
    <header className="border-b border-border bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <Breadcrumbs trail={trail} />
        <span className="eyebrow mt-8 block text-primary">{eyebrow}</span>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] text-foreground lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
          {intro}
        </p>
      </div>
    </header>
  );
}
