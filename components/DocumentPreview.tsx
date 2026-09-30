import type { FileKind } from "@/lib/file-kinds";

/** Aperçu intégré d'un document partagé (utilisé côté élève et dans l'éditeur de correction). */
export default function DocumentPreview({ url, kind, titre }: { url: string; kind: FileKind; titre: string }) {
  const frame = "h-[70vh] w-full rounded-xl border border-[var(--color-card-border)] bg-white lg:h-[calc(100vh-7rem)]";
  switch (kind) {
    case "pdf":
      // Le lecteur PDF intégré du navigateur (zoom, recherche, impression).
      return <iframe src={`${url}#view=FitH`} title={titre} className={frame} />;
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={url} alt={titre} className="mx-auto max-h-[80vh] w-auto rounded-xl" />;
    case "audio":
      return <audio src={url} controls preload="metadata" className="w-full" />;
    case "video":
      return <video src={url} controls preload="metadata" className="max-h-[80vh] w-full rounded-xl bg-black" />;
    case "office":
      // Visionneuse Microsoft en ligne : lit le fichier via son URL publique.
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
          title={titre}
          className={frame}
        />
      );
    default:
      return (
        <p className="rounded-xl bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-ink-soft)]">
          Pas d&apos;aperçu pour ce type de fichier — télécharge-le pour l&apos;ouvrir.
        </p>
      );
  }
}
