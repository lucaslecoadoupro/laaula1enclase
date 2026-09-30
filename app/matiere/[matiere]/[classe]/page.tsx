import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { getCoursCounts, getSequences, getSequencesForClasse } from "@/lib/pedago-repo";
import { loadClasse } from "@/lib/student-access";
import PageHeader from "@/components/PageHeader";
import RemiseCard from "@/components/RemiseCard";
import { getParcours } from "@/lib/remise/repo";
import { getActualitesForClasse } from "@/lib/actualites-repo";
import Feed from "@/components/Feed";
import { TONES, TONE_CYCLE } from "@/components/IconTile";

export const dynamic = "force-dynamic";

export default async function ClassePage({ params }: { params: Promise<{ matiere: string; classe: string }> }) {
  const { matiere: matiereSlug, classe: classeSlug } = await params;
  const { classe, admin } = await loadClasse(matiereSlug, classeSlug);
  const [sequences, counts] = await Promise.all([admin ? getSequences().then((all) => all.filter((s) => s.classes.includes(classeSlug))) : getSequencesForClasse(classeSlug), getCoursCounts()]);
  const base = `/matiere/${matiereSlug}/${classeSlug}`;
  // Côté élève : seulement les séquences qui ont au moins un cours publié.
  const visible = sequences.filter((s) => admin || (counts[s.id]?.published ?? 0) > 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow={classe.matiereLabel}
        title={`Classe de ${classe.classeLabel}`}
        subtitle="Tes séquences, les cours avec leurs corrigés, et un parcours pour reprendre les bases."
      />

      <section className="mt-10">
        <h2 className="section-label mb-3">Mes séquences</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s, i) => {
            const tone = TONES[TONE_CYCLE[i % TONE_CYCLE.length]];
            const n = admin ? (counts[s.id]?.total ?? 0) : (counts[s.id]?.published ?? 0);
            return (
              <Link key={s.id} href={`${base}/sequences/${s.id}`} className="card card-hover accent-ring group flex flex-col gap-3 rounded-3xl p-5">
                <span className={`icon-tile h-11 w-11 ${tone.bg} ${tone.text}`}>
                  <FolderOpen size={19} />
                </span>
                <span className="text-lg leading-snug font-bold text-[var(--color-ink)]">{s.titre}</span>
                {s.description && <span className="line-clamp-2 text-sm text-[var(--color-ink-soft)]">{s.description}</span>}
                <span className="mt-auto flex items-center justify-between pt-1 text-sm text-[var(--color-ink-soft)]">
                  <span className="flex items-center gap-1.5">
                    {Array.from({ length: Math.min(n, 6) }).map((_, k) => (
                      <span key={k} className={`h-2 w-2 rounded-full ${TONES[TONE_CYCLE[k % TONE_CYCLE.length]].dot}`} />
                    ))}
                    <span className="ml-1">
                      {n} cours
                    </span>
                  </span>
                  <ArrowRight size={16} className="text-[var(--color-ink-faint)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-teal)]" />
                </span>
              </Link>
            );
          })}
          {visible.length === 0 && <p className="text-[var(--color-ink-soft)]">Aucune séquence publiée pour l&apos;instant.</p>}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="section-label mb-3">Besoin de reprendre les bases ?</h2>
        <RemiseCard base={`${base}/remise-a-niveau`} titles={Object.fromEntries((await getParcours()).modules.map((m) => [m.id, m.title]))} />
      </section>

      <div className="mt-12">
        <Feed items={await getActualitesForClasse(classeSlug, 10)} title="Actualités" />
      </div>
    </main>
  );
}
