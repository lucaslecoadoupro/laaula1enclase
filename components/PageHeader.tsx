import type { ReactNode } from "react";

/** En-tête de page : grand titre, sous-titre, et un emplacement à droite (recherche, bouton…). */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  aside,
}: {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="rise-in flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <div className="mb-2 text-sm font-semibold text-[var(--color-teal)]">{eyebrow}</div>}
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2.5 leading-relaxed text-[var(--color-ink-soft)]">{subtitle}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
