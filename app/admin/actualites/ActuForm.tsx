"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Megaphone, Pin, Sparkles } from "lucide-react";
import { ACTU_TYPES, type Actualite, type ActuType } from "@/lib/actualites";
import type { Fichier } from "@/lib/fichier";
import ClassesPicker from "@/components/admin/ClassesPicker";
import FileUploader from "@/components/admin/FileUploader";

const ICONS = { info: Megaphone, document: FileText, production: Sparkles };

type Draft = {
  type: ActuType;
  titre: string;
  contenu: string;
  fichier: Fichier | null;
  lien: string;
  auteur: string;
  public: boolean;
  classes: string[];
  epingle: boolean;
};

const empty = (): Draft => ({ type: "info", titre: "", contenu: "", fichier: null, lien: "", auteur: "", public: true, classes: [], epingle: false });

export default function ActuForm({ initial, onDone }: { initial?: Actualite; onDone?: () => void }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => (initial ? { ...initial } : empty()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  function setType(type: ActuType) {
    // Une production d'élève est réservée aux classes par défaut (l'accueil est public).
    setD((x) => ({ ...x, type, public: type === "production" && !initial ? false : x.public }));
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch(initial ? `/api/admin/actualites/${initial.id}` : "/api/admin/actualites", {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    setBusy(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) return setError(data?.error ?? "Erreur lors de la publication.");
    if (!initial) setD(empty());
    router.refresh();
    onDone?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {ACTU_TYPES.map((t) => {
          const Icon = ICONS[t.id];
          return (
            <button key={t.id} type="button" onClick={() => setType(t.id)} className={`chip !px-3.5 !py-1.5 !text-sm ${d.type === t.id ? "chip-on" : ""}`} title={t.hint}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <input value={d.titre} onChange={(e) => set("titre", e.target.value)} placeholder={d.type === "production" ? "Titre (ex. Mi ciudad ideal — affiche)" : "Titre"} className="field !text-base font-semibold" />
      {d.type === "production" && (
        <input value={d.auteur} onChange={(e) => set("auteur", e.target.value)} placeholder="Auteur : prénom et classe (ex. Léa, 3B) — optionnel" className="field" />
      )}
      <textarea value={d.contenu} onChange={(e) => set("contenu", e.target.value)} rows={4} placeholder="Texte (optionnel). Les liens https://… deviennent cliquables." className="field resize-y" />

      <FileUploader
        value={d.fichier}
        label={d.type === "production" ? "la production (image, PDF, audio, vidéo…)" : "un fichier (optionnel)"}
        folder="actualites"
        onChange={(f) => set("fichier", f)}
      />
      <input value={d.lien} onChange={(e) => set("lien", e.target.value)} placeholder="Lien (optionnel) : site, vidéo, Digipad…" className="field" />

      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-4">
        <p className="section-label mb-2">Qui peut voir cette publication ?</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => set("public", true)} className={`chip ${d.public ? "chip-on" : ""}`}>
            Tout le monde (accueil)
          </button>
          <button type="button" onClick={() => set("public", false)} className={`chip ${!d.public ? "chip-on" : ""}`}>
            Seulement certaines classes
          </button>
        </div>
        {d.public ? (
          <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
            Visible sur l&apos;accueil, sans mot de passe.
            {d.type === "production" && " Pour une production d'élève : prénom seulement, pas de visage reconnaissable sans autorisation."}
          </p>
        ) : (
          <div className="mt-3">
            <ClassesPicker value={d.classes} onChange={(v) => set("classes", v)} />
            <p className="mt-2 text-xs text-[var(--color-ink-faint)]">Visible seulement dans l&apos;espace de ces classes (protégé par leur mot de passe).</p>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
        <input type="checkbox" checked={d.epingle} onChange={(e) => set("epingle", e.target.checked)} className="h-4 w-4 accent-[var(--color-teal)]" />
        <Pin size={14} /> Épingler en haut du fil
      </label>

      {error && <p className="text-sm text-[var(--color-coral)]">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={busy || !d.titre.trim()} className="btn btn-primary">
          {busy ? "Publication…" : initial ? "Enregistrer" : "Publier"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="btn btn-ghost">
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
