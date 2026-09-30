"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import ClassesPicker from "@/components/admin/ClassesPicker";

/** Création d'une séquence (titre + classes). */
export default function NewSequenceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState("");
  const [cls, setCls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre, classes: cls }),
    });
    setBusy(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Erreur lors de la création.");
      return;
    }
    router.push(`/admin/sequences/${data.id}`);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
        <Plus size={16} /> Nouvelle séquence
      </button>
    );
  }

  return (
    <div className="card rise-in flex w-full flex-col gap-4 rounded-3xl p-5 md:w-[28rem]">
      <p className="font-semibold text-[var(--color-ink)]">Nouvelle séquence</p>
      <input
        autoFocus
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre (ex. Séquence 1 — ¿Quién soy?)"
        className="field"
      />
      <div>
        <p className="section-label mb-2">Classes qui suivent cette séquence</p>
        <ClassesPicker value={cls} onChange={setCls} />
      </div>
      {error && <p className="text-sm text-[var(--color-coral)]">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={create} disabled={busy || !titre.trim() || cls.length === 0} className="btn btn-primary">
          {busy ? "Création…" : "Créer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
          Annuler
        </button>
      </div>
    </div>
  );
}
