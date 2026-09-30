"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Element } from "@/lib/pedago-repo";

export default function ElementMeta({ element }: { element: Element }) {
  const router = useRouter();
  const [titre, setTitre] = useState(element.titre);
  const [consigne, setConsigne] = useState(element.consigne);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = titre !== element.titre || consigne !== element.consigne;

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/elements/${element.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre, consigne }),
    });
    setBusy(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) return setMsg({ ok: false, text: data?.error ?? "Erreur lors de l'enregistrement." });
    setMsg({ ok: true, text: "Enregistré." });
    router.refresh();
  }

  return (
    <div className="card flex flex-col gap-4 rounded-3xl p-5 sm:p-6">
      <label className="flex flex-col gap-1.5">
        <span className="section-label">Titre</span>
        <input value={titre} onChange={(e) => setTitre(e.target.value)} className="field !text-base font-semibold" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="section-label">Consigne (optionnel)</span>
        <textarea value={consigne} onChange={(e) => setConsigne(e.target.value)} rows={3} className="field resize-y" placeholder="Ce que l'élève doit faire." />
      </label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy || !dirty || !titre.trim()} className="btn btn-primary">
          Enregistrer
        </button>
        {msg && <span className={`text-sm ${msg.ok ? "text-[var(--color-teal)]" : "text-[var(--color-coral)]"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
