import Link from "next/link";
import { notFound } from "next/navigation";
import { getCorrectionVisible } from "@/lib/corrections-repo";
import { SECTIONS } from "@/lib/pedago-repo";
import { playableQuestions } from "@/lib/qcm";
import { loadClasse, loadElement } from "@/lib/student-access";
import PageHeader from "@/components/PageHeader";
import DocumentView from "@/components/DocumentView";
import DraftBanner from "@/components/DraftBanner";
import QcmPlayer from "@/components/QcmPlayer";

export const dynamic = "force-dynamic";

export default async function ElementPage({
  params,
}: {
  params: Promise<{ matiere: string; classe: string; coursId: string; elementId: string }>;
}) {
  const { matiere, classe: classeSlug, coursId, elementId } = await params;
  const { admin } = await loadClasse(matiere, classeSlug);
  const { cours, element } = await loadElement(classeSlug, coursId, elementId, admin);
  const base = `/matiere/${matiere}/${classeSlug}`;
  const section = SECTIONS.find((s) => s.id === element.section)?.label ?? "";
  const questions = playableQuestions(element.questions);
  if (!admin && element.type === "fichier" && !element.fichier) notFound();
  const blocs = element.type === "fichier" ? await getCorrectionVisible(element.id, classeSlug) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      {cours.status === "draft" && <DraftBanner />}
      <Link href={`${base}/cours/${cours.id}`} className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        ← {cours.titre}
      </Link>
      <div className="mt-4">
        <PageHeader eyebrow={section} title={element.titre} />
        {element.consigne && <p className="prose-lite mt-3 max-w-3xl text-[var(--color-ink-soft)]">{element.consigne}</p>}
      </div>

      <section className="mt-8">
        {element.type === "qcm" ? (
          <div className="card mx-auto max-w-2xl rounded-3xl p-5 sm:p-8">
            <QcmPlayer questions={questions} />
          </div>
        ) : element.fichier ? (
          <DocumentView fichier={element.fichier} titre={element.titre} blocs={blocs} />
        ) : (
          <p className="text-[var(--color-ink-soft)]">Aucun fichier pour l&apos;instant.</p>
        )}
      </section>
    </main>
  );
}
