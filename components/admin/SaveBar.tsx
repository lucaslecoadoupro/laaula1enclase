"use client";

import type { ReactNode } from "react";

/** Barre d'enregistrement collée en bas de l'écran. */
export default function SaveBar({
  dirty,
  busy,
  error,
  onSave,
  label = "Enregistrer",
  extra,
  savedText = "Tout est enregistré",
}: {
  dirty: boolean;
  busy: boolean;
  error: string | null;
  onSave: () => void;
  label?: string;
  extra?: ReactNode;
  savedText?: string;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)]/95 p-3 backdrop-blur">
      <span className={`text-sm ${dirty ? "text-[var(--color-sun)]" : "text-[var(--color-ink-soft)]"}`}>{dirty ? "Modifications non enregistrées" : savedText}</span>
      {error && <span className="text-sm text-[var(--color-coral)]">{error}</span>}
      <span className="ml-auto flex gap-2">
        {extra}
        <button type="button" onClick={onSave} disabled={busy || !dirty} className="btn btn-primary">
          {busy ? "Enregistrement…" : label}
        </button>
      </span>
    </div>
  );
}
