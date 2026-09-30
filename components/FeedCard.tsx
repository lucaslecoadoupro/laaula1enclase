import { Fragment } from "react";
import { Download, ExternalLink, FileText, Megaphone, Pin, Sparkles, Users } from "lucide-react";
import type { Actualite } from "@/lib/actualites";
import { classes } from "@/lib/classes";
import { fileKind, formatSize, kindLabel } from "@/lib/file-kinds";
import DocumentIcon from "@/components/DocumentIcon";

const TYPE_STYLE = {
  info: { label: "Info", icon: Megaphone, color: "var(--color-sun)" },
  document: { label: "Document", icon: FileText, color: "var(--color-blue)" },
  production: { label: "Production d'élève", icon: Sparkles, color: "var(--color-coral)" },
} as const;

function relativeDate(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: days > 300 ? "numeric" : undefined });
}

/** Rend les URL du texte cliquables, sans HTML brut. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="break-all text-[var(--color-teal)] underline underline-offset-2">
            {p}
          </a>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        )
      )}
    </>
  );
}

export default function FeedCard({ actu, showAudience = false }: { actu: Actualite; showAudience?: boolean }) {
  const t = TYPE_STYLE[actu.type];
  const Icon = t.icon;
  const f = actu.fichier;
  const kind = f ? fileKind(f.contentType, f.pathname) : null;
  const audience = actu.public ? "Tout le monde" : classes.filter((c) => actu.classes.includes(c.classeSlug)).map((c) => c.classeLabel).join(", ");

  return (
    <article className={`card overflow-hidden rounded-3xl ${actu.type === "production" ? "ring-1 ring-[var(--color-coral)]/30" : ""}`}>
      {f && kind === "image" && (
        <a href={f.url} target="_blank" rel="noopener noreferrer" className="block bg-[var(--color-bg-deep)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.url} alt={actu.titre} loading="lazy" className="max-h-[28rem] w-full object-contain" />
        </a>
      )}
      <div className="flex flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold" style={{ color: t.color, background: `color-mix(in srgb, ${t.color} 14%, transparent)` }}>
            <Icon size={13} /> {t.label}
          </span>
          {actu.epingle && (
            <span className="inline-flex items-center gap-1 text-[var(--color-ink-soft)]">
              <Pin size={12} /> Épinglé
            </span>
          )}
          {showAudience && (
            <span className="inline-flex items-center gap-1 text-[var(--color-ink-faint)]">
              <Users size={12} /> {audience}
            </span>
          )}
          <time dateTime={actu.createdAt} className="ml-auto text-[var(--color-ink-faint)]">
            {relativeDate(actu.createdAt)}
          </time>
        </div>
        <h3 className="text-xl leading-snug font-bold text-[var(--color-ink)]">{actu.titre}</h3>
        {actu.type === "production" && actu.auteur && <p className="-mt-2 text-sm font-medium text-[var(--color-coral)]">par {actu.auteur}</p>}
        {actu.contenu && (
          <p className="prose-lite text-[var(--color-ink-soft)]">
            <Linkified text={actu.contenu} />
          </p>
        )}
        {f && kind === "audio" && <audio src={f.url} controls preload="metadata" className="w-full" />}
        {f && kind === "video" && <video src={f.url} controls preload="metadata" className="max-h-[28rem] w-full rounded-2xl bg-black" />}
        {f && kind !== "image" && kind !== "audio" && kind !== "video" && (
          <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-3 transition hover:border-[var(--color-teal)]">
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
        {actu.lien && (
          <a href={actu.lien} target="_blank" rel="noopener noreferrer" className="btn btn-ghost self-start !py-2 !text-xs">
            Ouvrir le lien <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  );
}
