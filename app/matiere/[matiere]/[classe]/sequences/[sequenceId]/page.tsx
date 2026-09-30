import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getElementCounts } from "@/lib/pedago-repo";
import { loadClasse, loadSequence } from "@/lib/student-access";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { TONES, TONE_CYCLE } from "@/components/IconTile";

export const dynamic = "force-dynamic";

export default async function SequencePage({ params }: { params: Promise<{ matiere: string; classe: string; sequenceId: string }> }) {
  const { matiere, classe: classeSlug, sequenceId } = await params;
  const { classe, admin } = await loadClasse(matiere, classeSlug);
  const { sequence, cours } = await loadSequence(classeSlug, sequenceId, admin);
  const elementCounts = await getElementCounts();
  const base = `/matiere/${matiere}/${classeSlug}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <Link href={base} className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        ← Classe de {classe.classeLabel}
      </Link>
      <div className="mt-4">
        <PageHeader eyebrow="Séquence" title={sequence.titre} subtitle={sequence.description || undefined} />
      </div>

      <ol className="mt-10 flex flex-col gap-3">
        {cours.map((c, i) => {
          const tone = TONES[TONE_CYCLE[i % TONE_CYCLE.length]];
          const n = elementCounts[c.id] ?? 0;
          return (
            <li key={c.id}>
              <Link href={`${base}/cours/${c.id}`} className="card card-hover accent-ring group flex items-center gap-5 rounded-3xl p-4 sm:p-5">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ${tone.bg} ${tone.text}`}>{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg leading-snug font-bold text-[var(--color-ink)]">{c.titre}</span>
                  <span className="mt-0.5 block text-sm text-[var(--color-ink-soft)]">
                    {[c.fichier ? "Document + corrigé" : null, n ? `${n} exercice${n > 1 ? "s" : ""}` : null].filter(Boolean).join(" · ") || "Cours"}
                  </span>
                </span>
                {admin && <StatusBadge status={c.status} />}
                <ArrowRight size={18} className="text-[var(--color-ink-faint)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-teal)]" />
              </Link>
            </li>
          );
        })}
        {cours.length === 0 && <p className="text-[var(--color-ink-soft)]">Aucun cours publié dans cette séquence pour l&apos;instant.</p>}
      </ol>
    </main>
  );
}
