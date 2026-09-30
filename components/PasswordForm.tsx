"use client";

import { useState } from "react";

/** Formulaire mot de passe partagé (classe et admin). */
export default function PasswordForm({
  endpoint,
  next,
  label,
  submitLabel,
}: {
  endpoint: string;
  next: string;
  label: string;
  submitLabel: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }
    // Navigation "dure" : garantit que le serveur voit le cookie qui vient d'être posé.
    window.location.assign(next);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm text-[var(--color-ink-soft)]">{label}</span>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field !py-3"
          placeholder="••••••••"
        />
      </label>
      {error && <p className="text-sm text-[var(--color-coral)]">{error}</p>}
      <button type="submit" disabled={loading || password.length === 0} className="btn btn-primary !py-3">
        {loading ? "Vérification…" : submitLabel}
      </button>
    </form>
  );
}
