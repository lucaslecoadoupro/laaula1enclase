import Link from "next/link";
import type { ReactNode } from "react";

export const TONES = {
  teal: { bg: "bg-[var(--color-teal)]/12", text: "text-[var(--color-teal)]", dot: "bg-[var(--color-teal)]" },
  coral: { bg: "bg-[var(--color-coral)]/12", text: "text-[var(--color-coral)]", dot: "bg-[var(--color-coral)]" },
  sun: { bg: "bg-[var(--color-sun)]/12", text: "text-[var(--color-sun)]", dot: "bg-[var(--color-sun)]" },
  blue: { bg: "bg-[var(--color-blue)]/15", text: "text-[#7fa9ff]", dot: "bg-[var(--color-blue)]" },
} as const;

export type Tone = keyof typeof TONES;
export const TONE_CYCLE: Tone[] = ["teal", "coral", "sun", "blue"];

/** Carte-lien avec icône teintée, titre, description et méta. */
export default function IconTile({
  href,
  icon,
  title,
  description,
  meta,
  badge,
  tone = "teal",
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description?: string;
  meta?: string;
  badge?: ReactNode;
  tone?: Tone;
}) {
  const t = TONES[tone];
  return (
    <Link href={href} className="card card-hover accent-ring flex items-start gap-4 rounded-2xl p-5">
      <span className={`icon-tile h-11 w-11 ${t.bg} ${t.text}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        {meta && <span className="block text-xs text-[var(--color-ink-faint)]">{meta}</span>}
        <span className="block text-base leading-snug font-semibold text-[var(--color-ink)]">{title}</span>
        {description && <span className="mt-1 block text-sm leading-relaxed text-[var(--color-ink-soft)]">{description}</span>}
      </span>
      {badge}
    </Link>
  );
}
