"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import type { Cours } from "@/lib/pedago-repo";

export default function CoursMeta({ cours }: { cours: Cours }) {
  const router = useRouter();
  const [titre, setTitre] = useState(cours.titre);
  const [description, setDescription] = useState(cours.description);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = titre !== cours.titre || description !== cours.description;

  async function patch(body: Record<string, unknown>, okText: string) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/cours/${cours.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) return setMsg({ ok: false, text: data?.error ?? "Erreur lors de l'enregistrement." });
    setMsg({ ok: true, text: okText });
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Supprimer le cours « ${cours.titre} » avec son document, ses exercices et ses corrigés ? C'est définitif.`)) return;
    setBusy(true);
    await fetch(`/api/admin/cours/${cours.id}`, { method: "DELETE" });
    router.push(`/admin/sequences/${cours.sequenceId}`);
    router.refresh();
  }

  const published = cours.status === "published";

  return (
    <div className="card flex flex-col gap-4 rounded-3xl p-5 sm:p-6">
      <div
        className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3 ${
          published ? "border-[var(--color-teal)]/40 bg-[var(--color-teal)]/8" : "border-[var(--color-line)] bg-[var(--color-bg-deep)]"
        }`}
      >
        {published ? <Eye size={18} className="text-[var(--color-teal)]" /> : <EyeOff size={18} className="text-[var(--color-ink-faint)]" />}
        <span className="text-sm text-[var(--color-ink)]">
          {published ? "Publié — visible par les classes de la séquence." : "Brouillon — invisible pour les élèves."}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => patch({ status: published ? "draft" : "published" }, published ? "Repassé en brouillon." : "Publié !")}
          className={`btn ml-auto ${published ? "btn-ghost" : "btn-primary"}`}
        >
          {published ? "Repasser en brouillon" : "Publier le cours"}
        </button>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="section-label">Titre du cours</span>
        <input value={titre} onChange={(e) => setTitre(e.target.value)} className="field !text-base font-semibold" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="section-label">Consigne ou présentation (optionnel, visible par les élèves)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="field resize-y"
          placeholder="Ex. Observe le document, puis réponds aux questions 1 à 4 dans ton cahier."
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || !dirty || !titre.trim()} onClick={() => patch({ titre, description }, "Enregistré.")} className="btn btn-primary">
          Enregistrer
        </button>
        {msg && <span className={`text-sm ${msg.ok ? "text-[var(--color-teal)]" : "text-[var(--color-coral)]"}`}>{msg.text}</span>}
        <button type="button" onClick={remove} disabled={busy} className="btn btn-danger ml-auto !text-xs">
          <Trash2 size={14} /> Supprimer le cours
        </button>
      </div>
    </div>
  );
}
