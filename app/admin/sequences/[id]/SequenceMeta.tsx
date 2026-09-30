"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ClassesPicker from "@/components/admin/ClassesPicker";
import type { Sequence } from "@/lib/pedago-repo";

export default function SequenceMeta({ sequence }: { sequence: Sequence }) {
  const router = useRouter();
  const [titre, setTitre] = useState(sequence.titre);
  const [description, setDescription] = useState(sequence.description);
  const [cls, setCls] = useState(sequence.classes);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = titre !== sequence.titre || description !== sequence.description || cls.join() !== sequence.classes.join();

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/sequences/${sequence.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre, description, classes: cls }),
    });
    setBusy(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) return setMsg({ ok: false, text: data?.error ?? "Erreur lors de l'enregistrement." });
    setMsg({ ok: true, text: "Enregistré." });
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Supprimer la séquence « ${sequence.titre} » avec tous ses cours, exercices, corrigés et fichiers ? C'est définitif.`)) return;
    setBusy(true);
    await fetch(`/api/admin/sequences/${sequence.id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="card flex flex-col gap-4 rounded-3xl p-5 sm:p-6">
      <label className="flex flex-col gap-1.5">
        <span className="section-label">Titre</span>
        <input value={titre} onChange={(e) => setTitre(e.target.value)} className="field !text-base font-semibold" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="section-label">Présentation (optionnel, visible par les élèves)</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="field resize-y" placeholder="Problématique, objectifs, tâche finale…" />
      </label>
      <div>
        <p className="section-label mb-2">Classes</p>
        <ClassesPicker value={cls} onChange={setCls} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={busy || !dirty || !titre.trim() || cls.length === 0} className="btn btn-primary">
          Enregistrer
        </button>
        {msg && <span className={`text-sm ${msg.ok ? "text-[var(--color-teal)]" : "text-[var(--color-coral)]"}`}>{msg.text}</span>}
        <button type="button" onClick={remove} disabled={busy} className="btn btn-danger ml-auto !text-xs">
          <Trash2 size={14} /> Supprimer la séquence
        </button>
      </div>
    </div>
  );
}
