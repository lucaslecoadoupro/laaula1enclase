"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { findModule, nextModule, type Checkpoint } from "@/lib/remise/content";
import { useParcours } from "./ParcoursContext";
import { useProgress } from "@/lib/remise/progress";
import QcmPlayer, { type QuestionResult } from "@/components/QcmPlayer";

type Stage = "intro" | "initial" | "result" | "retry" | "retry-result";

export default function BilanPlayer({ checkpoint: cp, base }: { checkpoint: Checkpoint; base: string }) {
  const { update } = useProgress();
  const parcours = useParcours();
  const [stage, setStage] = useState<Stage>("intro");
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [retryResults, setRetryResults] = useState<QuestionResult[]>([]);

  const score = results.filter((r) => r.correct).length;
  const helped = results.some((r) => r.helped);
  const passed = score >= cp.threshold;
  const toReview = Array.from(new Set(results.map((r, i) => (!r.correct ? cp.questions[i].reviewModule : null)).filter((x): x is string => !!x)));
  const retryScore = retryResults.filter((r) => r.correct).length;
  const next = nextModule(parcours, cp.afterModule);

  function saveInitial(r: QuestionResult[]) {
    setResults(r);
    const s = r.filter((x) => x.correct).length;
    update((p) => ({
      ...p,
      checkpoints: { ...p.checkpoints, [cp.id]: { score: s, max: cp.maxScore, helped: r.some((x) => x.helped), passed: s >= cp.threshold, at: new Date().toISOString() } },
      currentModule: next && s >= cp.threshold ? next.id : p.currentModule,
      currentStep: next && s >= cp.threshold ? "decouvrir" : p.currentStep,
    }));
    setStage("result");
  }

  function saveRetry(r: QuestionResult[]) {
    setRetryResults(r);
    const s = r.filter((x) => x.correct).length;
    update((p) => {
      const cur = p.checkpoints[cp.id];
      return {
        ...p,
        checkpoints: { ...p.checkpoints, [cp.id]: { ...cur, retryScore: s, helped: cur.helped || r.some((x) => x.helped), passed: s >= cp.threshold, at: new Date().toISOString() } },
      };
    });
    setStage("retry-result");
  }

  return (
    <div className="card rounded-3xl p-5 sm:p-8">
      {stage === "intro" && (
        <div className="flex flex-col items-start gap-4">
          <p className="leading-relaxed text-[var(--color-ink-soft)]">
            5 questions pour vérifier ce que tu retiens. Pas d&apos;indice affiché d&apos;office : l&apos;aide reste accessible, mais la réponse sera alors
            signalée « avec aide ». {cp.threshold}/{cp.maxScore} ou plus : tu peux continuer.
          </p>
          <button type="button" onClick={() => setStage("initial")} className="btn btn-primary">
            Commencer le bilan <ArrowRight size={15} />
          </button>
        </div>
      )}

      {stage === "initial" && <QcmPlayer questions={cp.questions} mode="bilan" summary={false} onComplete={saveInitial} title={`Bilan ${cp.id}`} />}

      {stage === "result" && (
        <div className="rise-in flex flex-col items-start gap-4">
          <p className="text-5xl font-bold text-[var(--color-ink)]">
            {score}
            <span className="text-2xl text-[var(--color-ink-faint)]">/{cp.maxScore}</span>
          </p>
          {helped && <p className="text-sm text-[var(--color-sun)]">Réalisé avec aide.</p>}
          {passed ? (
            <>
              <p className="text-[var(--color-ink)]">Bravo, tu peux continuer le parcours.</p>
              {next ? (
                <Link href={`${base}/${next.id}/decouvrir`} className="btn btn-primary">
                  Passer à {next.id} — {next.title} <ArrowRight size={15} />
                </Link>
              ) : (
                <Link href={base} className="btn btn-primary">
                  Retour au parcours
                </Link>
              )}
            </>
          ) : (
            <>
              <p className="text-[var(--color-ink)]">Quelques points à revoir avant de continuer :</p>
              <ReviewList ids={toReview} base={base} />
              <button type="button" onClick={() => setStage("retry")} className="btn btn-primary">
                <RotateCcw size={15} /> Nouvel essai
              </button>
            </>
          )}
        </div>
      )}

      {stage === "retry" && <QcmPlayer questions={cp.retry} mode="bilan" summary={false} onComplete={saveRetry} title={`Bilan ${cp.id} · nouvel essai`} />}

      {stage === "retry-result" && (
        <div className="rise-in flex flex-col items-start gap-4">
          <p className="text-sm font-semibold text-[var(--color-teal)]">Nouvel essai</p>
          <p className="text-5xl font-bold text-[var(--color-ink)]">
            {retryScore}
            <span className="text-2xl text-[var(--color-ink-faint)]">/{cp.retry.length}</span>
          </p>
          {retryScore >= cp.threshold ? (
            <p className="text-[var(--color-ink)]">C&apos;est mieux ! Tu peux continuer.</p>
          ) : (
            <p className="text-[var(--color-ink)]">
              Continue avec les modules à revoir, et parles-en à ton professeur : ces points sont à consolider ensemble.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {next && (
              <Link href={`${base}/${next.id}/decouvrir`} className="btn btn-primary">
                Continuer avec {next.id} <ArrowRight size={15} />
              </Link>
            )}
            <Link href={base} className="btn btn-ghost">
              Retour au parcours
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewList({ ids, base }: { ids: string[]; base: string }) {
  const parcours = useParcours();
  return (
    <ul className="flex w-full flex-col gap-2">
      {ids.map((id) => {
        const m = findModule(parcours, id);
        if (!m) return null;
        return (
          <li key={id}>
            <Link href={`${base}/${m.id}/comprendre`} className="card card-hover flex items-center gap-3 rounded-2xl p-3">
              <span className="text-xs font-bold text-[var(--color-teal)]">{m.id}</span>
              <span className="flex-1 text-sm font-semibold text-[var(--color-ink)]">{m.title}</span>
              <ArrowRight size={15} className="text-[var(--color-ink-faint)]" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
