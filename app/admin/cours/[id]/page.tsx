import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { classes } from "@/lib/classes";
import { getCorrection } from "@/lib/corrections-repo";
import { SECTIONS, getCours, getElementsOfCours, getSequence } from "@/lib/pedago-repo";
import Breadcrumb from "@/components/admin/Breadcrumb";
import FichierField from "@/components/admin/FichierField";
import DocumentWithCorrection from "@/components/admin/DocumentWithCorrection";
import StatusBadge from "@/components/admin/StatusBadge";
import CoursMeta from "./CoursMeta";
import ElementsManager from "./ElementsManager";

export const dynamic = "force-dynamic";

export default async function AdminCoursPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cours = await getCours(id);
  if (!cours) notFound();
  const [sequence, elements, blocs] = await Promise.all([getSequence(cours.sequenceId), getElementsOfCours(id), getCorrection(id)]);
  if (!sequence) notFound();
  const firstClasse = classes.find((c) => sequence.classes.includes(c.classeSlug));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ href: "/admin", label: "Mes séquences" }, { href: `/admin/sequences/${sequence.id}`, label: sequence.titre }, { label: cours.titre }]} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">{cours.titre}</h1>
        <StatusBadge status={cours.status} />
        {firstClasse && (
          <Link
            href={`/matiere/${firstClasse.matiereSlug}/${firstClasse.classeSlug}/cours/${cours.id}`}
            target="_blank"
            className="btn btn-ghost ml-auto !py-2 !text-xs"
          >
            Voir comme la {firstClasse.classeLabel} <ExternalLink size={13} />
          </Link>
        )}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="card rounded-3xl p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Document du cours</h2>
          <p className="mb-4 text-sm text-[var(--color-ink-soft)]">Le support principal (texte, image, affiche, audio…).</p>
          <FichierField endpoint={`/api/admin/cours/${cours.id}`} value={cours.fichier} />
        </section>
        <CoursMeta key={cours.updatedAt} cours={cours} />
      </div>

      {cours.fichier && (
        <section className="mt-8">
          <DocumentWithCorrection targetId={cours.id} fichier={cours.fichier} titre={cours.titre} blocs={blocs} classSlugs={sequence.classes} />
        </section>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {SECTIONS.map((s) => (
          <ElementsManager
            key={s.id + elements.map((e) => e.id + e.updatedAt).join()}
            coursId={cours.id}
            section={s.id}
            label={s.label}
            hint={s.hint}
            initial={elements.filter((e) => e.section === s.id)}
          />
        ))}
      </div>
    </main>
  );
}
