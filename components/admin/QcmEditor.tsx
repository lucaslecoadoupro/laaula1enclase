"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { emptyQuestion, playableQuestions, type QcmQuestion } from "@/lib/qcm";
import QcmPlayer from "@/components/QcmPlayer";
import QuestionsEditor from "./QuestionsEditor";
import SaveBar from "./SaveBar";

/** Retire les choix vides et recale l'indice de la bonne réponse. */
export function cleanQuestions<T extends QcmQuestion>(questions: T[]): T[] {
  return questions
    .filter((q) => q.prompt.trim() || q.options.some((o) => o.trim()))
    .map((q) => {
      const kept = q.options.map((o, i) => ({ o: o.trim(), i })).filter((x) => x.o);
      const correct = Math.max(0, kept.findIndex((x) => x.i === q.correctIndex));
      return { ...q, prompt: q.prompt.trim(), options: kept.map((x) => x.o), correctIndex: correct };
    });
}

export default function QcmEditor({ elementId, initial }: { elementId: string; initial: QcmQuestion[] }) {
  const [questions, setQuestions] = useState<QcmQuestion[]>(initial.length ? initial : [emptyQuestion()]);
  const [saved, setSaved] = useState(JSON.stringify(initial.length ? initial : [emptyQuestion()]));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const dirty = JSON.stringify(questions) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function save() {
    setBusy(true);
    setError(null);
    const cleaned = cleanQuestions(questions);
    if (cleaned.some((q) => q.options.length < 2)) {
      setBusy(false);
      setError("Chaque question doit avoir au moins deux choix remplis.");
      return;
    }
    const res = await fetch(`/api/admin/elements/${elementId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: cleaned }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Erreur lors de l'enregistrement.");
      return;
    }
    const next = cleaned.length ? cleaned : [emptyQuestion()];
    setQuestions(next);
    setSaved(JSON.stringify(next));
  }

  const playable = playableQuestions(questions);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Questions</h2>
        <span className="text-xs text-[var(--color-ink-faint)]">
          {playable.length} question{playable.length > 1 ? "s" : ""} prête{playable.length > 1 ? "s" : ""}
        </span>
        <button type="button" onClick={() => setPreview((p) => !p)} className="btn btn-ghost ml-auto !py-1.5 !text-xs">
          {preview ? <Pencil size={13} /> : <Eye size={13} />} {preview ? "Retour à l'édition" : "Tester comme un élève"}
        </button>
      </div>
      {preview ? (
        <div className="card rounded-2xl p-5 sm:p-7">
          <QcmPlayer key={JSON.stringify(playable)} questions={playable} />
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--color-ink-soft)]">
            Coche la bonne réponse. L&apos;indice s&apos;affiche après une première erreur, l&apos;explication quand l&apos;élève a trouvé ou après deux erreurs.
          </p>
          <QuestionsEditor value={questions} onChange={setQuestions} />
        </>
      )}
      <SaveBar dirty={dirty} busy={busy} error={error} onSave={save} label="Enregistrer le QCM" />
    </div>
  );
}
