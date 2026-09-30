import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { classes } from "@/lib/classes";
import { getHomeContent } from "@/lib/site-content-repo";
import { getActualitesPubliques } from "@/lib/actualites-repo";
import Feed from "@/components/Feed";
import PageHeader from "@/components/PageHeader";
import { TONES, TONE_CYCLE } from "@/components/IconTile";

export const dynamic = "force-dynamic";

/** Regroupe les classes par niveau : 3e, 4e… */
function byNiveau() {
  const map = new Map<string, typeof classes>();
  for (const c of classes) {
    const n = `${c.classeLabel.match(/^\d+/)?.[0] ?? ""}e`;
    if (!map.has(n)) map.set(n, []);
    map.get(n)!.push(c);
  }
  return Array.from(map);
}

export default async function Home() {
  const [content, actus] = await Promise.all([getHomeContent(), getActualitesPubliques(7)]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader title={content.title} subtitle={content.subtitle} />

      {content.message && (
        <div className="card mt-8 flex items-start gap-3 rounded-2xl p-5">
          <span className="icon-tile h-10 w-10 bg-[var(--color-sun)]/12 text-[var(--color-sun)]">
            <Megaphone size={18} />
          </span>
          <p className="prose-lite pt-1.5 text-sm text-[var(--color-ink)]">{content.message}</p>
        </div>
      )}

      {byNiveau().map(([niveau, list]) => (
        <section key={niveau} className="mt-10">
          <h2 className="section-label mb-3">Élèves de {niveau}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((c, i) => {
              const tone = TONES[TONE_CYCLE[i % TONE_CYCLE.length]];
              return (
                <Link
                  key={c.classeSlug}
                  href={`/matiere/${c.matiereSlug}/${c.classeSlug}`}
                  className="card card-hover accent-ring group flex flex-col rounded-2xl p-5"
                >
                  <span className={`h-1.5 w-10 rounded-full ${tone.dot}`} />
                  <span className="mt-6 text-4xl font-bold tracking-tight text-[var(--color-ink)]">{c.classeLabel}</span>
                  <span className="mt-1 flex items-center justify-between text-sm text-[var(--color-ink-soft)]">
                    {c.matiereLabel}
                    <ArrowRight size={16} className="text-[var(--color-ink-faint)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-teal)]" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <div className="mt-14">
        <Feed items={actus.slice(0, 6)} moreHref={actus.length > 6 ? "/actualites" : undefined} />
      </div>
    </main>
  );
}
