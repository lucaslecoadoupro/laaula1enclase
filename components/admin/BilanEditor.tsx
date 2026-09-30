"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import type { Checkpoint } from "@/lib/remise/content";
import QuestionsEditor, { type EditableQuestion } from "./QuestionsEditor";
import SaveBar from "./SaveBar";
import { cleanQuestions } from "./QcmEditor";

type Draft = { threshold: number; questions: EditableQuestion[]; retry: EditableQuestion[] };

const toDraft = (c: Checkpoint): Draft => ({
  threshold: c.threshold,
  questions: c.questions.map((q) => ({ prompt: q.prompt, options: [...q.options], correctIndex: q.correctIndex, hint: q.hint, explanation: q.explanation, reviewModule: q.reviewModule })),
  retry: c.retry.map((q) => ({ prompt: q.prompt, options: [...q.options], correctIndex: q.correctIndex, hint: q.hint, explanation: q.explanation, reviewModule: q.reviewModule })),
});

export default function BilanEditor({
  checkpoint,
  modules,
  modified,
}: {
  checkpoint: Checkpoint;
  modules: { id: string; title: string }[];
  modified: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => toDraft(checkpoint));
  const [saved, setSaved] = useState(() => JSON.stringify(toDraft(checkpoint)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/remise/bilans/${checkpoint.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkpoint: { threshold: draft.threshold, questions: cleanQuestions(draft.questions), retry: cleanQuestions(draft.retry) } }),
    });
    setBusy(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) return setError(data?.error ?? "Erreur lors de l'enregistrement.");
    const fresh = toDraft(data.checkpoint);
    setDraft(fresh);
    setSaved(JSON.stringify(fresh));
    router.refresh();
  }

  async function reset() {
    if (!confirm(`Remettre le bilan ${checkpoint.id} dans sa version d'origine ?`)) return;
    setBusy(true);
    await fetch(`/api/admin/remise/bilans/${checkpoint.id}`, { method: "DELETE" });
    setSaved(JSON.stringify(draft));
    setTimeout(() => window.location.reload(), 50);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card flex flex-col gap-3 rounded-3xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Seuil de réussite</h2>
        <label className="flex items-center gap-3 text-sm text-[var(--color-ink-soft)]">
          Bonnes réponses nécessaires pour continuer :
          <input
            type="number"
            min={1}
            max={Math.max(1, draft.questions.length)}
            value={draft.threshold}
            onChange={(e) => setDraft({ ...draft, threshold: Number(e.target.value) || 1 })}
            className="field !w-20"
          />
          <span>sur {draft.questions.length}</span>
        </label>
      </section>
      <section className="card flex flex-col gap-3 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Questions du bilan</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">Sans indice d&apos;office. En cas d&apos;erreur, le module choisi est proposé à la révision.</p>
        </div>
        <QuestionsEditor value={draft.questions} onChange={(v) => setDraft({ ...draft, questions: v })} reviewModules={modules} max={10} />
      </section>
      <section className="card flex flex-col gap-3 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Nouvel essai</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">Questions proposées quand le seuil n&apos;est pas atteint.</p>
        </div>
        <QuestionsEditor value={draft.retry} onChange={(v) => setDraft({ ...draft, retry: v })} reviewModules={modules} max={10} />
      </section>
      <SaveBar
        dirty={dirty}
        busy={busy}
        error={error}
        onSave={save}
        label="Enregistrer le bilan"
        savedText={modified ? "Enregistré — version modifiée" : "Version d'origine du kit"}
        extra={
          modified ? (
            <button type="button" onClick={reset} disabled={busy} className="btn btn-ghost">
              <RotateCcw size={14} /> Version du kit
            </button>
          ) : null
        }
      />
    </div>
  );
}
