"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import type { HomeContent } from "@/lib/site-content-repo";

export default function HomeContentPanel({ initial }: { initial: HomeContent }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [message, setMessage] = useState(initial.message);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const inputClass = "field";

  async function save() {
    setSaving(true);
    await fetch("/api/admin/home-content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, message }),
    });
    setSaving(false);
    setSavedAt(Date.now());
    router.refresh();
  }

  return (
    <div className="card rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <span className="icon-tile h-10 w-10 bg-[var(--color-sun)]/12 text-[var(--color-sun)]">
          <Home size={18} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">
            Page d&apos;accueil
          </h2>
          <p className="text-sm text-[var(--color-ink-soft)]">
            Ce que voient les élèves en arrivant sur le site, avant de choisir leur classe.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--color-ink-soft)]">Titre de la page d&apos;accueil</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--color-ink-soft)]">Sous-titre</label>
          <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--color-ink-soft)]">
            Message / actualité <span className="text-[var(--color-ink-faint)]">(optionnel — affiché sous le titre si rempli)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Ex : Contrôle vendredi pour les 3E, pensez à réviser le vocabulaire de la maison."
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {savedAt && <span className="text-xs text-[var(--color-ink-faint)]">Enregistré — visible immédiatement sur la home.</span>}
      </div>
    </div>
  );
}
