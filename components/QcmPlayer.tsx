"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Check, Lightbulb, RotateCcw, X } from "lucide-react";
import type { QcmQuestion } from "@/lib/qcm";

export type QuestionResult = {
  /** Réussie au premier essai, sans indice. */
  firstTry: boolean;
  errors: number;
  /** Indice ou solution affichés. */
  helped: boolean;
  /** Erreur persistante : la solution a été donnée. */
  consolider: boolean;
  /** Mode bilan : réponse juste ou non. */
  correct: boolean;
};

type Phase = "answering" | "correct" | "wrong-hint" | "wrong-solution" | "consolider" | "bilan-feedback";

/**
 * Une question par écran.
 * - Mode "training" (arbre de décision du parcours) : bonne réponse → explication ;
 *   1re erreur → indice + nouvel essai ; 2e erreur → solution expliquée + nouvel essai ;
 *   erreur persistante → on continue, question marquée « à consolider ».
 * - Mode "bilan" : une seule réponse, sans indice affiché d'office ; l'indice reste
 *   accessible mais la question est alors signalée « avec aide ».
 */
export default function QcmPlayer({
  questions,
  mode = "training",
  onComplete,
  helpSlot,
  summary = true,
  title,
}: {
  questions: QcmQuestion[];
  mode?: "training" | "bilan";
  onComplete?: (results: QuestionResult[]) => void;
  /** Contenu d'aide affiché avec la solution (lien vers la leçon, mémo…). */
  helpSlot?: ReactNode;
  /** Afficher l'écran de fin par défaut. */
  summary?: boolean;
  title?: string;
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("answering");
  const [errors, setErrors] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const total = questions.length;

  function restart() {
    setIndex(0);
    setChoice(null);
    setPhase("answering");
    setErrors(0);
    setHintShown(false);
    setResults([]);
    setDone(false);
  }

  if (total === 0) {
    return <p className="text-sm text-[var(--color-ink-soft)]">Aucune question pour l&apos;instant.</p>;
  }

  if (done) {
    if (!summary) return null;
    const firstTry = results.filter((r) => (mode === "bilan" ? r.correct : r.firstTry)).length;
    const toReview = results.map((r, i) => ({ r, i })).filter(({ r }) => (mode === "bilan" ? !r.correct : r.consolider || r.errors > 0));
    return (
      <div className="rise-in flex flex-col items-start gap-4">
        <p className="text-sm font-semibold text-[var(--color-teal)]">Terminé</p>
        <p className="text-4xl font-bold text-[var(--color-ink)]">
          {firstTry}
          <span className="text-2xl text-[var(--color-ink-faint)]">/{total}</span>
        </p>
        <p className="text-sm text-[var(--color-ink-soft)]">
          {mode === "bilan" ? "bonnes réponses" : "réussies du premier coup"}
        </p>
        {toReview.length > 0 && (
          <div className="w-full rounded-2xl border border-[var(--color-line)] p-4">
            <p className="text-sm font-semibold text-[var(--color-ink)]">À revoir</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-ink-soft)]">
              {toReview.map(({ i }) => (
                <li key={i}>
                  <span className="text-[var(--color-ink)]">{questions[i].prompt}</span> →{" "}
                  <span className="text-[var(--color-teal)]">{questions[i].options[questions[i].correctIndex]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" onClick={restart} className="btn btn-ghost">
          <RotateCcw size={15} /> Recommencer
        </button>
      </div>
    );
  }

  function record(result: QuestionResult) {
    const next = [...results, result];
    setResults(next);
    if (index + 1 >= total) {
      setDone(true);
      onComplete?.(next);
    } else {
      setIndex(index + 1);
      setChoice(null);
      setPhase("answering");
      setErrors(0);
      setHintShown(false);
    }
  }

  function validate() {
    if (choice === null) return;
    const ok = choice === q.correctIndex;

    if (mode === "bilan") {
      setPhase("bilan-feedback");
      return;
    }
    if (ok) {
      setPhase("correct");
      return;
    }
    const e = errors + 1;
    setErrors(e);
    setPhase(e === 1 ? "wrong-hint" : e === 2 ? "wrong-solution" : "consolider");
  }

  function next() {
    const ok = choice === q.correctIndex;
    if (mode === "bilan") {
      record({ firstTry: ok && !hintShown, errors: ok ? 0 : 1, helped: hintShown, consolider: false, correct: ok });
      return;
    }
    if (phase === "correct") {
      record({ firstTry: errors === 0 && !hintShown, errors, helped: errors > 0 || hintShown, consolider: false, correct: true });
    } else if (phase === "consolider") {
      record({ firstTry: false, errors, helped: true, consolider: true, correct: false });
    }
  }

  function retry() {
    setChoice(null);
    setPhase("answering");
  }

  const locked = phase !== "answering";
  const showSolution = phase === "wrong-solution" || phase === "consolider" || phase === "bilan-feedback";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {title && <span className="text-sm font-semibold text-[var(--color-ink-soft)]">{title}</span>}
        <span className="ml-auto text-xs text-[var(--color-ink-faint)]">
          Question {index + 1} sur {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
        <div className="h-full rounded-full bg-[var(--color-teal)] transition-all" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <p key={index} className="rise-in text-xl leading-snug font-semibold text-[var(--color-ink)]">
        {q.prompt}
      </p>

      <div className="flex flex-col gap-2.5" role="radiogroup">
        {q.options.map((opt, i) => {
          if (!opt.trim()) return null;
          const selected = choice === i;
          const isAnswer = i === q.correctIndex;
          let style = "border-[var(--color-line)] hover:border-[var(--color-teal)]";
          if (selected && !locked) style = "border-[var(--color-teal)] bg-[var(--color-teal)]/10";
          if (locked && selected && (phase === "correct" || (phase === "bilan-feedback" && isAnswer)))
            style = "border-[var(--color-teal)] bg-[var(--color-teal)]/15";
          if (locked && selected && !isAnswer) style = "border-[var(--color-coral)] bg-[var(--color-coral)]/10";
          if (showSolution && isAnswer) style = "border-[var(--color-teal)] bg-[var(--color-teal)]/15";
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={locked}
              onClick={() => setChoice(i)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-base text-[var(--color-ink)] transition disabled:cursor-default ${style}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  selected && locked && !isAnswer
                    ? "border-transparent bg-[var(--color-coral)] text-[var(--color-bg)]"
                    : selected
                      ? "border-transparent bg-[var(--color-teal)] text-[var(--color-teal-ink)]"
                      : "border-[var(--color-line)] text-[var(--color-ink-faint)]"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {locked && showSolution && isAnswer && <Check size={18} className="text-[var(--color-teal)]" />}
              {locked && selected && phase === "correct" && <Check size={18} className="text-[var(--color-teal)]" />}
              {locked && selected && !isAnswer && <X size={18} className="text-[var(--color-coral)]" />}
            </button>
          );
        })}
      </div>

      {/* Retours */}
      {phase === "correct" && (
        <Feedback tone="teal" title="Bien joué !">
          {q.explanation}
        </Feedback>
      )}
      {phase === "wrong-hint" && (
        <Feedback tone="sun" title="Pas encore — voici un indice">
          {q.hint || "Relis bien la question et élimine les réponses impossibles."}
        </Feedback>
      )}
      {phase === "wrong-solution" && (
        <Feedback tone="coral" title={`La bonne réponse : ${q.options[q.correctIndex]}`}>
          {q.explanation}
          {helpSlot && <div className="mt-2">{helpSlot}</div>}
          <div className="mt-2 text-[var(--color-ink-soft)]">Relis l&apos;explication, puis refais un essai.</div>
        </Feedback>
      )}
      {phase === "consolider" && (
        <Feedback tone="coral" title="On continue — cette notion est à consolider">
          {q.explanation} Tu pourras en parler à ton professeur.
        </Feedback>
      )}
      {phase === "bilan-feedback" && (
        <Feedback tone={choice === q.correctIndex ? "teal" : "coral"} title={choice === q.correctIndex ? "Juste" : `Réponse : ${q.options[q.correctIndex]}`}>
          {q.explanation}
        </Feedback>
      )}
      {mode === "bilan" && hintShown && phase === "answering" && (
        <Feedback tone="sun" title="Indice (réponse signalée « avec aide »)">
          {q.hint}
        </Feedback>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {phase === "answering" && (
          <button type="button" onClick={validate} disabled={choice === null} className="btn btn-primary">
            Valider
          </button>
        )}
        {(phase === "wrong-hint" || phase === "wrong-solution") && (
          <button type="button" onClick={retry} className="btn btn-primary">
            <RotateCcw size={15} /> Nouvel essai
          </button>
        )}
        {(phase === "correct" || phase === "consolider" || phase === "bilan-feedback") && (
          <button type="button" onClick={next} className="btn btn-primary">
            {index + 1 >= total ? "Terminer" : "Question suivante"} <ArrowRight size={15} />
          </button>
        )}
        {mode === "bilan" && phase === "answering" && !hintShown && q.hint && (
          <button type="button" onClick={() => setHintShown(true)} className="btn btn-ghost">
            <Lightbulb size={15} /> Besoin d&apos;aide
          </button>
        )}
      </div>
    </div>
  );
}

function Feedback({ tone, title, children }: { tone: "teal" | "sun" | "coral"; title: string; children: ReactNode }) {
  const color = { teal: "var(--color-teal)", sun: "var(--color-sun)", coral: "var(--color-coral)" }[tone];
  return (
    <div className="rise-in rounded-2xl border p-4 text-sm leading-relaxed" style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)`, background: `color-mix(in srgb, ${color} 8%, transparent)` }}>
      <p className="font-semibold" style={{ color }}>
        {title}
      </p>
      <div className="mt-1 text-[var(--color-ink)]">{children}</div>
    </div>
  );
}
