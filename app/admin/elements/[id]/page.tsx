import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { classes } from "@/lib/classes";
import { getCorrection } from "@/lib/corrections-repo";
import { SECTIONS, getCours, getElement, getSequence } from "@/lib/pedago-repo";
import Breadcrumb from "@/components/admin/Breadcrumb";
import FichierField from "@/components/admin/FichierField";
import DocumentWithCorrection from "@/components/admin/DocumentWithCorrection";
import QcmEditor from "@/components/admin/QcmEditor";
import ElementMeta from "./ElementMeta";

export const dynamic = "force-dynamic";

export default async function AdminElementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const element = await getElement(id);
  if (!element) notFound();
  const cours = await getCours(element.coursId);
  const sequence = cours ? await getSequence(cours.sequenceId) : null;
  if (!cours || !sequence) notFound();
  const blocs = element.type === "fichier" ? await getCorrection(element.id) : [];
  const sectionLabel = SECTIONS.find((s) => s.id === element.section)?.label ?? "";
  const firstClasse = classes.find((c) => sequence.classes.includes(c.classeSlug));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb
        items={[
          { href: "/admin", label: "Mes séquences" },
          { href: `/admin/sequences/${sequence.id}`, label: sequence.titre },
          { href: `/admin/cours/${cours.id}`, label: cours.titre },
          { label: element.titre },
        ]}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-teal)]">
            {sectionLabel} · {element.type === "qcm" ? "QCM" : "Fichier + corrigé"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">{element.titre}</h1>
        </div>
        {firstClasse && (
          <Link
            href={`/matiere/${firstClasse.matiereSlug}/${firstClasse.classeSlug}/cours/${cours.id}/${element.id}`}
            target="_blank"
            className="btn btn-ghost ml-auto !py-2 !text-xs"
          >
            Voir comme la {firstClasse.classeLabel} <ExternalLink size={13} />
          </Link>
        )}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {element.type === "fichier" ? (
          <section className="card rounded-3xl p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-[var(--color-ink)]">Fichier de l&apos;exercice</h2>
            <FichierField endpoint={`/api/admin/elements/${element.id}`} value={element.fichier} label="l'exercice" />
          </section>
        ) : (
          <section className="lg:row-span-2">
            <QcmEditor elementId={element.id} initial={element.questions} />
          </section>
        )}
        <ElementMeta key={element.updatedAt} element={element} />
      </div>

      {element.type === "fichier" && element.fichier && (
        <section className="mt-8">
          <DocumentWithCorrection targetId={element.id} fichier={element.fichier} titre={element.titre} blocs={blocs} classSlugs={sequence.classes} />
        </section>
      )}
    </main>
  );
}
