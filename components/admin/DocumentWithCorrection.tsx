import type { Fichier } from "@/lib/fichier";
import type { CorrectionBloc } from "@/lib/corrections-repo";
import { classes } from "@/lib/classes";
import { fileKind } from "@/lib/file-kinds";
import DocumentPreview from "@/components/DocumentPreview";
import CorrectionEditor from "@/components/admin/CorrectionEditor";

/** Aperçu du document à gauche, éditeur de corrigé à droite. */
export default function DocumentWithCorrection({
  targetId,
  fichier,
  titre,
  blocs,
  classSlugs,
}: {
  targetId: string;
  fichier: Fichier;
  titre: string;
  blocs: CorrectionBloc[];
  classSlugs: string[];
}) {
  const options = classes.filter((c) => classSlugs.includes(c.classeSlug)).map((c) => ({ slug: c.classeSlug, label: c.classeLabel }));
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <DocumentPreview url={fichier.url} kind={fileKind(fichier.contentType, fichier.pathname)} titre={titre} />
      </div>
      <CorrectionEditor documentId={targetId} initial={blocs} options={options} />
    </div>
  );
}
