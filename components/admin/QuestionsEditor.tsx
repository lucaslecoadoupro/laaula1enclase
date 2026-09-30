"use client";

import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { emptyQuestion, type QcmQuestion } from "@/lib/qcm";

export type EditableQuestion = QcmQuestion & { reviewModule?: string };

/**
 * Éditeur contrôlé d'une liste de questions à choix unique.
 * `reviewModules` : si fourni, chaque question choisit le module à revoir en cas d'erreur (bilans).
 */
export default function QuestionsEditor({
  value,
  onChange,
  reviewModules,
  addLabel = "Ajouter une question",
  max = 20,
}: {
  value: EditableQuestion[];
  onChange: (v: EditableQuestion[]) => void;
  reviewModules?: { id: string; title: string }[];
  addLabel?: string;
  max?: number;
}) {
  const update = (i: number, patch: Partial<EditableQuestion>) => onChange(value.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {value.map((q, i) => (
        <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal)]/12 text-xs font-bold text-[var(--color-teal)]">{i + 1}</span>
            <input
              value={q.prompt}
              onChange={(e) => update(i, { prompt: e.target.value })}
              placeholder="Énoncé (ex. Yo ___ catorce años.)"
              className="field flex-1 !text-base font-semibold"
            />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-30" aria-label="Monter">
              <ArrowUp size={15} />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-30" aria-label="Descendre">
              <ArrowDown size={15} />
            </button>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-coral)]" aria-label="Supprimer la question">
              <Trash2 size={15} />
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:pl-9">
            {q.options.map((opt, k) => (
              <div key={k} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${i}-${q.prompt.length}`}
                  checked={q.correctIndex === k}
                  onChange={() => update(i, { correctIndex: k })}
                  className="h-4 w-4 accent-[var(--color-teal)]"
                  aria-label={`Choix ${k + 1} est la bonne réponse`}
                />
                <input
                  value={opt}
                  onChange={(e) => update(i, { options: q.options.map((o, j) => (j === k ? e.target.value : o)) })}
                  placeholder={`Choix ${String.fromCharCode(65 + k)}`}
                  className={`field flex-1 ${q.correctIndex === k ? "!border-[var(--color-teal)]/60" : ""}`}
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() =>
                      update(i, {
                        options: q.options.filter((_, j) => j !== k),
                        correctIndex: q.correctIndex === k ? 0 : q.correctIndex > k ? q.correctIndex - 1 : q.correctIndex,
                      })
                    }
                    className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-coral)]"
                    aria-label="Retirer ce choix"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {q.options.length < 6 && (
              <button type="button" onClick={() => update(i, { options: [...q.options, ""] })} className="self-start text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-teal)]">
                + Ajouter un choix
              </button>
            )}
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <input value={q.hint} onChange={(e) => update(i, { hint: e.target.value })} placeholder="Indice (après une erreur)" className="field" />
              <input value={q.explanation} onChange={(e) => update(i, { explanation: e.target.value })} placeholder="Explication" className="field" />
            </div>
            {reviewModules && (
              <label className="flex items-center gap-2 text-xs text-[var(--color-ink-soft)]">
                Module à revoir en cas d&apos;erreur
                <select value={q.reviewModule ?? reviewModules[0]?.id} onChange={(e) => update(i, { reviewModule: e.target.value })} className="field !w-auto !py-1.5">
                  {reviewModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} — {m.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      ))}

      {value.length < max && (
        <button
          type="button"
          onClick={() => onChange([...value, reviewModules ? { ...emptyQuestion(), reviewModule: reviewModules[0]?.id } : emptyQuestion()])}
          className="btn btn-ghost border-dashed !py-3 text-[var(--color-ink-soft)]"
        >
          <Plus size={15} /> {addLabel}
        </button>
      )}
    </div>
  );
}
