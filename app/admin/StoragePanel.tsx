"use client";

import { useState } from "react";
import { CheckCircle2, HardDrive, Loader2, XCircle } from "lucide-react";

type Result = { ok: boolean; environment: string; checks: { ok: boolean; label: string; detail?: string }[] };

/** Vérifie la configuration du stockage de fichiers (Vercel Blob) et explique quoi corriger. */
export default function StoragePanel() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stockage", { cache: "no-store" });
      if (!res.ok) throw new Error(`Réponse ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="stockage" className="card scroll-mt-6 rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <span className="icon-tile h-10 w-10 bg-[var(--color-teal)]/12 text-[var(--color-teal)]">
          <HardDrive size={18} />
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Stockage des fichiers</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">Vercel Blob : documents des cours, audios, publications.</p>
        </div>
        <button type="button" onClick={run} disabled={busy} className="btn btn-primary">
          {busy ? <Loader2 size={15} className="animate-spin" /> : null} Vérifier le stockage
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-[var(--color-coral)]">Vérification impossible : {error}</p>}

      {result && (
        <div className="mt-5 flex flex-col gap-3">
          <p className={`text-sm font-semibold ${result.ok ? "text-[var(--color-teal)]" : "text-[var(--color-coral)]"}`}>
            {result.ok ? "Tout fonctionne : tu peux envoyer des fichiers." : "Le stockage n'est pas prêt :"}
            <span className="ml-2 font-normal text-[var(--color-ink-faint)]">(environnement : {result.environment})</span>
          </p>
          {result.checks.map((c, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-3">
              {c.ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-teal)]" /> : <XCircle size={18} className="mt-0.5 shrink-0 text-[var(--color-coral)]" />}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{c.label}</p>
                {c.detail && <p className="mt-0.5 text-sm break-words whitespace-pre-line text-[var(--color-ink-soft)]">{c.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
