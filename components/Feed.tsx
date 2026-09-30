import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Actualite } from "@/lib/actualites";
import FeedCard from "@/components/FeedCard";

/** Fil d'actualité : productions en mosaïque sur deux colonnes, le reste en liste. */
export default function Feed({ items, title = "Fil d'actualité", moreHref }: { items: Actualite[]; title?: string; moreHref?: string }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">{title}</h2>
        {moreHref && (
          <Link href={moreHref} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-teal)] hover:underline">
            Tout voir <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="columns-1 gap-4 md:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
        {items.map((a) => (
          <FeedCard key={a.id} actu={a} />
        ))}
      </div>
    </section>
  );
}
