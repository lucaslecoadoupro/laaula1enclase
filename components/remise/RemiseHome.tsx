"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Flag, LineChart } from "lucide-react";
import { useParcours } from "./ParcoursContext";
import { moduleState, stepsDone, STATE_LABELS, TOTAL_STEPS, useProgress, type ModuleState } from "@/lib/remise/progress";

export const STATE_STYLE: Record<ModuleState, string> = {
  "a-commencer": "bg-[var(--color-line)] text-[var(--color-ink-soft)]",
  "en-cours": "bg-[var(--color-blue)]/20 text-[#8fb4ff]",
  "termine-sans-aide": "bg-[var(--color-teal)]/15 text-[var(--color-teal)]",
  "termine-avec-aide": "bg-[var(--color-sun)]/15 text-[var(--color-sun)]",
  "a-consolider": "bg-[var(--color-coral)]/15 text-[var(--color-coral)]",
};

export default function RemiseHome({ base, classeLabel }: { base: string; classeLabel: string }) {
  const { progress, ready } = useProgress();
  const { modules: MODULES, checkpoints: CHECKPOINTS } = useParcours();
  const done = stepsDone(progress);
  const started = ready && done > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <Link href={base.replace(/\/remise-a-niveau$/, "")} className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        ← Classe de {classeLabel}
      </Link>

      <div className="card rise-in mt-4 grid overflow-hidden rounded-3xl md:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <p className="text-sm font-semibold text-[var(--color-sun)]">Remise à niveau · Je débute en espagnol</p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">Conexión español</h1>
          <p className="leading-relaxed text-[var(--color-ink-soft)]">
            12 modules pour reprendre toutes les bases. Chaque module suit la même routine : découvrir, comprendre, s&apos;entraîner, copier la leçon,
            appliquer sur ta fiche, vérifier. Tu peux t&apos;arrêter quand tu veux et reprendre au même endroit.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={`${base}/${progress.currentModule}/${progress.currentStep}`} className="btn btn-primary">
              {started ? `Reprendre ${progress.currentModule}` : "Commencer S01"} <ArrowRight size={15} />
            </Link>
            <Link href={`${base}/memos`} className="btn btn-ghost">
              <BookOpen size={15} /> Mémos
            </Link>
            <Link href={`${base}/progression`} className="btn btn-ghost">
              <LineChart size={15} /> Ma progression
            </Link>
          </div>
          {started && (
            <div className="mt-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                <div className="h-full rounded-full bg-[var(--color-sun)]" style={{ width: `${Math.round((done / TOTAL_STEPS) * 100)}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-ink-faint)]">
                {done} étapes réalisées sur {TOTAL_STEPS}
              </p>
            </div>
          )}
        </div>
        <div className="relative min-h-56">
          <Image src="/remise/couverture.webp" alt="Trois collégiens discutent devant leur collège" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => {
          const state = ready ? moduleState(progress, m) : "a-commencer";
          const cp = CHECKPOINTS.find((c) => c.afterModule === m.id);
          const cpRecord = cp ? progress.checkpoints[cp.id] : undefined;
          return (
            <div key={m.id} className="contents">
              <Link href={`${base}/${m.id}/decouvrir`} className="card card-hover accent-ring flex flex-col gap-2 rounded-2xl p-4">
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--color-teal)]">{m.id}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATE_STYLE[state]}`}>{STATE_LABELS[state]}</span>
                </span>
                <span className="text-lg leading-snug font-bold text-[var(--color-ink)]">{m.title}</span>
                <span className="text-sm text-[var(--color-ink-soft)]">{m.objective}</span>
              </Link>
              {cp && (
                <Link
                  href={`${base}/bilans/${cp.id}`}
                  className="accent-ring flex items-center gap-3 rounded-2xl border border-dashed border-[var(--color-sun)]/50 p-4 transition hover:border-[var(--color-sun)]"
                >
                  <span className="icon-tile h-10 w-10 bg-[var(--color-sun)]/12 text-[var(--color-sun)]">
                    <Flag size={17} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-[var(--color-ink)]">Bilan {cp.id}</span>
                    <span className="block text-xs text-[var(--color-ink-soft)]">
                      {cpRecord ? `Dernier score : ${cpRecord.retryScore ?? cpRecord.score}/${cp.maxScore}${cpRecord.helped ? " (avec aide)" : ""}` : `5 questions après ${cp.afterModule}`}
                    </span>
                  </span>
                  <ArrowRight size={16} className="text-[var(--color-ink-faint)]" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
