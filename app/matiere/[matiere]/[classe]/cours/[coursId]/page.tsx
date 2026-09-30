import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, ListChecks } from "lucide-react";
import { getCorrectionVisible } from "@/lib/corrections-repo";
import { SECTIONS, getElementsOfCours } from "@/lib/pedago-repo";
import { playableQuestions } from "@/lib/qcm";
import { loadClasse, loadCours } from "@/lib/student-access";
import PageHeader from "@/components/PageHeader";
import DocumentView from "@/components/DocumentView";
import DraftBanner from "@/components/DraftBanner";
import IconTile from "@/components/IconTile";

export const dynamic = "force-dynamic";

export default async function CoursPage({ params }: { params: Promise<{ matiere: string; classe: string; coursId: string }> }) {
  const { matiere, classe: classeSlug, coursId } = await params;
  const { admin } = await loadClasse(matiere, classeSlug);
  const { cours, sequence, siblings } = await loadCours(classeSlug, coursId, admin);
  const [elements, blocs] = await Promise.all([getElementsOfCours(cours.id), getCorrectionVisible(cours.id, classeSlug)]);
  const base = `/matiere/${matiere}/${classeSlug}`;
  const idx = siblings.findIndex((c) => c.id === cours.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx + 1 < siblings.length ? siblings[idx + 1] : null;
  // Un QCM vide ou un exercice sans fichier n'est pas montré aux élèves.
  const ready = elements.filter((e) => (e.type === "qcm" ? playableQuestions(e.questions).length > 0 : !!e.fichier) || admin);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      {cours.status === "draft" && <DraftBanner />}
      <Link href={`${base}/sequences/${sequence.id}`} className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        ← {sequence.titre}
      </Link>
      <div className="mt-4">
        <PageHeader eyebrow={`Cours ${idx + 1}`} title={cours.titre} />
        {cours.description && <p className="prose-lite mt-3 max-w-3xl text-[var(--color-ink-soft)]">{cours.description}</p>}
      </div>

      {cours.fichier && (
        <section className="mt-8">
          <DocumentView fichier={cours.fichier} titre={cours.titre} blocs={blocs} />
        </section>
      )}

      {SECTIONS.map((s) => {
        const list = ready.filter((e) => e.section === s.id);
        if (list.length === 0) return null;
        return (
          <section key={s.id} className="mt-12">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">{s.label}</h2>
            <p className="mb-4 text-sm text-[var(--color-ink-soft)]">{s.hint}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((e) => {
                const n = playableQuestions(e.questions).length;
                return (
                  <IconTile
                    key={e.id}
                    href={`${base}/cours/${cours.id}/${e.id}`}
                    icon={e.type === "qcm" ? <ListChecks size={18} /> : <FileText size={18} />}
                    tone={e.type === "qcm" ? "sun" : s.id === "approfondissement" ? "coral" : "blue"}
                    meta={e.type === "qcm" ? `QCM · ${n} question${n > 1 ? "s" : ""}` : "Exercice + corrigé"}
                    title={e.titre}
                    description={e.consigne ? e.consigne.split("\n")[0] : undefined}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {(prev || next) && (
        <nav className="mt-14 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {prev ? (
            <Link href={`${base}/cours/${prev.id}`} className="btn btn-ghost">
              <ArrowLeft size={15} /> {prev.titre}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`${base}/cours/${next.id}`} className="btn btn-ghost">
              {next.titre} <ArrowRight size={15} />
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
