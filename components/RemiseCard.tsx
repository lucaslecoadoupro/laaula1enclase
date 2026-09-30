"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useProgress, stepsDone, TOTAL_STEPS } from "@/lib/remise/progress";

/** Carte d'entrée de la Remise à niveau, avec la progression gardée sur l'appareil. */
export default function RemiseCard({ base, titles }: { base: string; titles: Record<string, string> }) {
  const { progress, ready } = useProgress();
  const done = stepsDone(progress);
  const started = ready && done > 0;
  const pct = Math.round((done / TOTAL_STEPS) * 100);

  return (
    <Link
      href={base}
      className="card card-hover accent-ring group grid overflow-hidden rounded-3xl md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
    >
      <div className="relative h-44 md:order-2 md:h-full md:min-h-60">
        <Image src="/remise/couverture.webp" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent md:bg-gradient-to-r" />
      </div>
      <div className="flex flex-col gap-3 p-6 sm:p-7">
        <span className="text-sm font-semibold text-[var(--color-sun)]">Remise à niveau</span>
        <span className="text-2xl leading-tight font-bold text-[var(--color-ink)] sm:text-3xl">Conexión español</span>
        <span className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Reprends toutes les bases à ton rythme : 12 modules, un entraînement corrigé, des leçons à recopier et trois bilans.
        </span>
        {started && (
          <span className="mt-1 flex flex-col gap-1.5">
            <span className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
              <span className="block h-full rounded-full bg-[var(--color-sun)]" style={{ width: `${pct}%` }} />
            </span>
            <span className="text-xs text-[var(--color-ink-faint)]">
              {done} étapes sur {TOTAL_STEPS} · en cours : {progress.currentModule} {titles[progress.currentModule] ?? ""}
            </span>
          </span>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-[var(--color-teal)]">
          {started ? "Reprendre" : "Commencer"} <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
