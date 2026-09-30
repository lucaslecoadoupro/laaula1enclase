import { Download, ExternalLink } from "lucide-react";
import type { Fichier } from "@/lib/fichier";
import type { CorrectionBloc } from "@/lib/corrections-repo";
import { fileKind, formatSize, kindLabel } from "@/lib/file-kinds";
import DocumentPreview from "@/components/DocumentPreview";
import CorrectionColumn from "@/components/CorrectionColumn";

/** Document + boutons + colonne de corrigé (si des blocs sont dévoilés). */
export default function DocumentView({ fichier, titre, blocs }: { fichier: Fichier; titre: string; blocs: CorrectionBloc[] }) {
  const kind = fileKind(fichier.contentType, fichier.pathname);
  const downloadUrl = `${fichier.url}${fichier.url.includes("?") ? "&" : "?"}download=1`;
  return (
    <div className={`grid gap-6 ${blocs.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
      <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-ink-faint)]">{[kindLabel(kind), formatSize(fichier.taille)].filter(Boolean).join(" · ")}</span>
          <a href={fichier.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost ml-auto !py-1.5 !text-xs">
            <ExternalLink size={13} /> Plein écran
          </a>
          <a href={downloadUrl} className="btn btn-primary !py-1.5 !text-xs">
            <Download size={13} /> Télécharger
          </a>
        </div>
        <DocumentPreview url={fichier.url} kind={kind} titre={titre} />
      </div>
      {blocs.length > 0 && <CorrectionColumn blocs={blocs} />}
    </div>
  );
}
