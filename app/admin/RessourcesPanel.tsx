"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Trash2 } from "lucide-react";
import type { Ressource } from "@/lib/ressources-repo";

const inputClass = "field";

function RessourceRow({ ressource, onSaved, onDeleted }: { ressource: Ressource; onSaved: () => void; onDeleted: () => void }) {
  const [titre, setTitre] = useState(ressource.titre);
  const [description, setDescription] = useState(ressource.description);
  const [url, setUrl] = useState(ressource.url);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await fetch(`/api/admin/ressources/${ressource.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre, description, url }),
    });
    setBusy(false);
    onSaved();
  }

  async function remove() {
    if (!confirm(`Supprimer "${ressource.titre}" ?`)) return;
    setBusy(true);
    await fetch(`/api/admin/ressources/${ressource.id}`, { method: "DELETE" });
    setBusy(false);
    onDeleted();
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[var(--color-line)] p-3 sm:flex-row sm:items-start">
      <div className="flex flex-1 flex-col gap-2">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre" className={inputClass} />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className={inputClass}
        />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL ou /documents/..." className={inputClass} />
      </div>
      <div className="flex gap-2 sm:flex-col">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="btn btn-primary flex-1 !text-xs sm:flex-none"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="btn btn-danger !px-3"
          aria-label="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function RessourcesPanel({ initial }: { initial: Ressource[] }) {
  const router = useRouter();
  const [ressources, setRessources] = useState(initial);
  const [newTitre, setNewTitre] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/admin/ressources");
    const data = await res.json();
    setRessources(data.ressources ?? []);
    router.refresh();
  }

  async function addRessource() {
    if (!newTitre.trim() || !newUrl.trim()) return;
    setBusy(true);
    await fetch("/api/admin/ressources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre: newTitre, description: newDescription, url: newUrl }),
    });
    setNewTitre("");
    setNewDescription("");
    setNewUrl("");
    setBusy(false);
    await refresh();
  }

  return (
    <div className="card rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <span className="icon-tile h-10 w-10 bg-[var(--color-blue)]/15 text-[#7fa9ff]">
          <FileText size={18} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Ressources</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">Visibles sur /ressources, sans mot de passe.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {ressources.map((r) => (
          <RessourceRow key={r.id} ressource={r} onSaved={refresh} onDeleted={refresh} />
        ))}
        {ressources.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">Aucune ressource pour l&apos;instant.</p>}
      </div>

      <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-dashed border-[var(--color-line)] p-3 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-2">
          <input value={newTitre} onChange={(e) => setNewTitre(e.target.value)} placeholder="Titre" className={inputClass} />
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optionnel)"
            className={inputClass}
          />
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL ou /documents/..." className={inputClass} />
        </div>
        <button
          type="button"
          onClick={addRessource}
          disabled={busy || !newTitre.trim() || !newUrl.trim()}
          className="btn btn-ghost"
        >
          <Plus size={15} />
          Ajouter
        </button>
      </div>
    </div>
  );
}
