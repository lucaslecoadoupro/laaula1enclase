"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { classes } from "@/lib/classes";
import type { Creation, CreationInput } from "@/lib/musee";
import FileUploader from "@/components/admin/FileUploader";

const empty = (): CreationInput => ({ titre: "", prenoms: "", classe: "", description: "", fichier: null });

export default function CreationForm({ initial, onDone }: { initial?: Creation; onDone?: () => void }) {
  const router = useRouter();
  const [d, setD] = useState<CreationInput>(() =>
    initial ? { titre: initial.titre, prenoms: initial.prenoms, classe: initial.classe, description: initial.description, fichier: initial.fichier } : empty()
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof CreationInput>(k: K, v: CreationInput[K]) => setD((x) => ({ ...x, [k]: v }));

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch(initial ? `/api/admin/musee/${initial.id}` : "/api/admin/musee", {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    setBusy(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) return setError(data?.error ?? "Erreur lors de l'enregistrement.");
    if (!initial) setD(empty());
    router.refresh();
    onDone?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <FileUploader value={d.fichier} label="la création (image, PDF, audio, vidéo…)" folder="musee" onChange={(f) => set("fichier", f)} />

      <input value={d.prenoms} onChange={(e) => set("prenoms", e.target.value)} placeholder="Prénom(s) — ex. Léa et Hugo" className="field !text-base font-semibold" />

      <div>
        <p className="section-label mb-2">Classe</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => set("classe", "")} className={`chip !px-3 !py-1 !text-sm ${d.classe === "" ? "chip-on" : ""}`}>
            Non précisée
          </button>
          {classes.map((c) => (
            <button
              key={c.classeSlug}
              type="button"
              onClick={() => set("classe", c.classeSlug)}
              className={`chip !px-3 !py-1 !text-sm ${d.classe === c.classeSlug ? "chip-on" : ""}`}
            >
              {c.classeLabel}
            </button>
          ))}
        </div>
      </div>

      <input value={d.titre} onChange={(e) => set("titre", e.target.value)} placeholder="Titre de l'œuvre (optionnel) — ex. Mi ciudad ideal" className="field" />
      <textarea value={d.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Petit mot (optionnel) : consigne, contexte…" className="field resize-y" />

      <p className="text-xs text-[var(--color-ink-faint)]">
        Le Musée est public (sans mot de passe) : prénoms seulement, pas de visage reconnaissable sans autorisation.
      </p>

      {error && <p className="text-sm text-[var(--color-coral)]">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={busy || !d.fichier || !d.prenoms.trim()} className="btn btn-primary">
          {busy ? "Enregistrement…" : initial ? "Enregistrer" : "Exposer au Musée"}
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
