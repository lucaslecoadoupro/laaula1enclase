"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, FileText, Plus } from "lucide-react";
import type { Cours } from "@/lib/pedago-repo";
import StatusBadge from "@/components/admin/StatusBadge";

export default function CoursList({
  sequenceId,
  initial,
  elementCounts,
}: {
  sequenceId: string;
  initial: Cours[];
  elementCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [cours, setCours] = useState(initial);
  const [titre, setTitre] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!titre.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/admin/sequences/${sequenceId}/cours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre }),
    });
    setBusy(false);
    if (!res.ok) return;
    const { id } = await res.json();
    router.push(`/admin/cours/${id}`);
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= cours.length) return;
    const next = [...cours];
    [next[i], next[j]] = [next[j], next[i]];
    setCours(next);
    await fetch(`/api/admin/sequences/${sequenceId}/cours`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((c) => c.id) }),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {cours.map((c, i) => (
        <div key={c.id} className="card flex items-center gap-3 rounded-2xl p-3 pl-4">
          <span className="w-6 text-center text-lg font-bold text-[var(--color-ink-faint)]">{i + 1}</span>
          <Link href={`/admin/cours/${c.id}`} className="min-w-0 flex-1 hover:text-[var(--color-teal)]">
            <span className="block truncate font-semibold text-[var(--color-ink)]">{c.titre}</span>
            <span className="flex items-center gap-3 text-xs text-[var(--color-ink-faint)]">
              <span className="flex items-center gap-1">
                <FileText size={12} /> {c.fichier ? "Document ajouté" : "Pas de document"}
              </span>
              <span>
                {elementCounts[c.id] ?? 0} exercice{(elementCounts[c.id] ?? 0) > 1 ? "s" : ""}
              </span>
            </span>
          </Link>
          <StatusBadge status={c.status} />
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-30" aria-label="Monter">
            <ArrowUp size={15} />
          </button>
          <button type="button" onClick={() => move(i, 1)} disabled={i === cours.length - 1} className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-30" aria-label="Descendre">
            <ArrowDown size={15} />
          </button>
        </div>
      ))}
      {cours.length === 0 && <p className="text-sm text-[var(--color-ink-soft)]">Aucun cours dans cette séquence pour l&apos;instant.</p>}

      <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre du nouveau cours (ex. Cours 1 — Me presento)" className="field flex-1" />
        <button type="submit" disabled={busy || !titre.trim()} className="btn btn-primary">
          <Plus size={15} /> Ajouter le cours
        </button>
      </form>
    </div>
  );
}
