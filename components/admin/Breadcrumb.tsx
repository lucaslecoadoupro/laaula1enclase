import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-[var(--color-ink-faint)]">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} />}
          {it.href ? (
            <Link href={it.href} className="hover:text-[var(--color-ink)]">
              {it.label}
            </Link>
          ) : (
            <span className="text-[var(--color-ink-soft)]">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
