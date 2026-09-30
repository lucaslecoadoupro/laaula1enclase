"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, FileText, ListChecks, Plus, Trash2 } from "lucide-react";
import type { Element, Section } from "@/lib/pedago-repo";
import { playableQuestions } from "@/lib/qcm";

export default function ElementsManager({
  coursId,
  section,
  label,
  hint,
  initial,
}: {
  coursId: string;
  section: Section;
  label: string;
  hint: string;
  initial: Element[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [titre, setTitre] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(type: "fichier" | "qcm") {
    const t = titre.trim() || (type === "qcm" ? `QCM ${items.length + 1}` : `Exercice ${items.length + 1}`);
    setBusy(true);
    const res = await fetch(`/api/admin/cours/${coursId}/elements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, type, titre: t }),
    });
    setBusy(false);
    if (!res.ok) return;
    const { id } = await res.json();
    router.push(`/admin/elements/${id}`);
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    await fetch(`/api/admin/cours/${coursId}/elements`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((e) => e.id) }),
    });
  }

  async function remove(el: Element) {
    if (!confirm(`Supprimer « ${el.titre} » ?`)) return;
    setItems((xs) => xs.filter((x) => x.id !== el.id));
    await fetch(`/api/admin/elements/${el.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="card rounded-3xl p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--color-ink)]">{label}</h2>
      <p className="text-sm text-[var(--color-ink-soft)]">{hint}</p>

      <div className="mt-4 flex flex-col gap-2">
        {items.map((el, i) => {
          const n = playableQuestions(el.questions).length;
          const status = el.type === "qcm" ? `${n} question${n > 1 ? "s" : ""}` : el.fichier ? "Fichier ajouté" : "Pas encore de fichier";
          return (
            <div key={el.id} className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-2.5 pl-3">
              <span
                className={`icon-tile h-9 w-9 ${el.type === "qcm" ? "bg-[var(--color-sun)]/12 text-[var(--color-sun)]" : "bg-[var(--color-blue)]/15 text-[#7fa9ff]"}`}
              >
                {el.type === "qcm" ? <ListChecks size={16} /> : <FileText size={16} />}
              </span>
              <Link href={`/admin/elements/${el.id}`} className="min-w-0 flex-1 hover:text-[var(--color-teal)]">
                <span className="block truncate text-sm font-semibold text-[var(--color-ink)]">{el.titre}</span>
                <span className="block text-xs text-[var(--color-ink-faint)]">
                  {el.type === "qcm" ? "QCM" : "Fichier + corrigé"} · {status}
                </span>
              </Link>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-30" aria-label="Monter">
                <ArrowUp size={15} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-30" aria-label="Descendre">
                <ArrowDown size={15} />
              </button>
              <button type="button" onClick={() => remove(el)} className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-coral)]" aria-label="Supprimer">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">Rien pour l&apos;instant.</p>}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre (optionnel)" className="field flex-1" />
        <div className="flex gap-2">
          <button type="button" disabled={busy} onClick={() => add("fichier")} className="btn btn-ghost">
            <Plus size={14} /> Fichier
          </button>
          <button type="button" disabled={busy} onClick={() => add("qcm")} className="btn btn-ghost">
            <Plus size={14} /> QCM
          </button>
        </div>
      </div>
    </section>
  );
}
