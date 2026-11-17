import { Download } from "lucide-react";
import type { Creation } from "@/lib/musee";
import { findClasseBySlug } from "@/lib/classes";
import { fileKind, formatSize, kindLabel } from "@/lib/file-kinds";
import DocumentIcon from "@/components/DocumentIcon";

/** Une œuvre du Musée : la création, puis son cartel (titre, prénoms, classe). */
export default function CreationCard({ creation }: { creation: Creation }) {
  const f = creation.fichier;
  const kind = f ? fileKind(f.contentType, f.pathname) : null;
  const classe = findClasseBySlug(creation.classe)?.classeLabel;
  const alt = creation.titre || `Création de ${creation.prenoms}`;

  return (
    <figure className="card overflow-hidden rounded-3xl">
      {f && kind === "image" && (
        <a href={f.url} target="_blank" rel="noopener noreferrer" className="block bg-[var(--color-bg-deep)] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.url} alt={alt} loading="lazy" className="w-full rounded-xl object-contain" />
        </a>
      )}
      {f && kind === "video" && <video src={f.url} controls preload="metadata" className="max-h-[28rem] w-full bg-black" />}

      <figcaption className="flex flex-col gap-2 p-5">
        {creation.titre && <h3 className="text-lg leading-snug font-bold text-[var(--color-ink)]">{creation.titre}</h3>}
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-[var(--color-coral)]">{creation.prenoms}</span>
          {classe && (
            <span className="rounded-full bg-[var(--color-teal)]/12 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-teal)]">{classe}</span>
          )}
        </p>
        {creation.description && <p className="prose-lite text-sm whitespace-pre-line text-[var(--color-ink-soft)]">{creation.description}</p>}
        {f && kind === "audio" && <audio src={f.url} controls preload="metadata" className="mt-1 w-full" />}
        {f && kind !== "image" && kind !== "audio" && kind !== "video" && (
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-3 transition hover:border-[var(--color-teal)]"
          >
            <span className="icon-tile h-10 w-10 bg-[var(--color-blue)]/15 text-[#7fa9ff]">
              <DocumentIcon kind={kind!} size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--color-ink)]">{f.nom}</span>
              <span className="block text-xs text-[var(--color-ink-faint)]">{[kindLabel(kind!), formatSize(f.taille)].filter(Boolean).join(" · ")}</span>
            </span>
            <Download size={16} className="text-[var(--color-ink-faint)]" />
          </a>
        )}
      </figcaption>
    </figure>
  );
}
