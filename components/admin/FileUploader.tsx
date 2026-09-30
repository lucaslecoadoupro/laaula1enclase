"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ExternalLink, RefreshCw, Upload, X } from "lucide-react";
import type { Fichier } from "@/lib/fichier";
import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE, fileKind, formatSize, kindLabel } from "@/lib/file-kinds";
import DocumentIcon from "@/components/DocumentIcon";

/**
 * Envoie un fichier directement du navigateur vers Vercel Blob, puis appelle
 * `onChange` avec le fichier à enregistrer sur le cours / l'exercice.
 */
export default function FileUploader({
  value,
  onChange,
  label = "le document",
  folder = "cours",
  accept,
}: {
  value: Fichier | null;
  onChange: (f: Fichier | null) => Promise<void> | void;
  label?: string;
  /** Dossier de rangement dans le stockage. */
  folder?: string;
  /** Types acceptés dans le sélecteur de fichier (par défaut : tous les types autorisés). */
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function send(file: File | null | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > MAX_FILE_SIZE) {
      setError(`Fichier trop lourd (${formatSize(file.size)}) — maximum ${formatSize(MAX_FILE_SIZE)}.`);
      return;
    }
    setProgress(0);
    try {
      const safeName = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
      const blob = await upload(`${folder}/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      await onChange({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || file.type,
        taille: file.size,
        nom: file.name,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        /content type/i.test(msg)
          ? "Type de fichier non accepté (PDF, images, audio, vidéo, Word, PowerPoint, Excel, OpenDocument)."
          : `Envoi impossible : ${msg} — Clique sur « Vérifier le stockage » dans Espace enseignant → Réglages du site pour savoir quoi corriger.`
      );
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const uploading = progress !== null;
  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept ?? ALLOWED_CONTENT_TYPES.join(",") + ",.pdf,.docx,.pptx,.xlsx,.odt,.odp,.mp3,.m4a"}
      onChange={(e) => send(e.target.files?.[0])}
      className="hidden"
    />
  );

  if (value && !uploading) {
    const kind = fileKind(value.contentType, value.pathname);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] px-4 py-3">
          <span className="icon-tile h-9 w-9 bg-[var(--color-teal)]/12 text-[var(--color-teal)]">
            <DocumentIcon kind={kind} size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-[var(--color-ink)]">{value.nom}</span>
            <span className="block text-xs text-[var(--color-ink-faint)]">
              {[kindLabel(kind), formatSize(value.taille)].filter(Boolean).join(" · ")}
            </span>
          </span>
          <a href={value.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !px-3 !py-1.5 !text-xs">
            Ouvrir <ExternalLink size={13} />
          </a>
          <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-ghost !px-3 !py-1.5 !text-xs">
            <RefreshCw size={13} /> Remplacer
          </button>
          <button
            type="button"
            onClick={() => confirm(`Retirer ${label} ? Le fichier sera supprimé.`) && onChange(null)}
            className="btn btn-danger !px-2 !py-1.5"
            aria-label="Retirer le fichier"
          >
            <X size={14} />
          </button>
          {input}
        </div>
        {error && <p className="text-sm text-[var(--color-coral)]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          send(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragOver ? "border-[var(--color-teal)] bg-[var(--color-teal)]/5" : "border-[var(--color-line)] hover:border-[var(--color-teal)]"
        }`}
      >
        <Upload size={22} className="text-[var(--color-teal)]" />
        <span className="text-sm font-medium text-[var(--color-ink)]">
          {uploading ? `Envoi… ${progress}%` : `Glisse ${label} ici ou clique pour choisir`}
        </span>
        <span className="text-xs text-[var(--color-ink-faint)]">PDF, image, audio, vidéo, Word, PowerPoint… 50 Mo max</span>
        {uploading && (
          <span className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--color-line)]">
            <span className="block h-full bg-[var(--color-teal)] transition-all" style={{ width: `${progress}%` }} />
          </span>
        )}
        {input}
      </label>
      {error && <p className="text-sm text-[var(--color-coral)]">{error}</p>}
    </div>
  );
}
