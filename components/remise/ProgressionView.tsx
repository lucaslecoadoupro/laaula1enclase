"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Download, RotateCcw, Upload } from "lucide-react";
import { STEPS } from "@/lib/remise/content";
import { useParcours } from "./ParcoursContext";
import {
  STATE_LABELS,
  TOTAL_STEPS,
  emptyProgress,
  exportCode,
  importCode,
  moduleState,
  saveProgress,
  stepsDone,
  useProgress,
} from "@/lib/remise/progress";
import { STATE_STYLE } from "./RemiseHome";

export default function ProgressionView({ base }: { base: string }) {
  const { progress, ready } = useProgress();
  const { modules: MODULES, checkpoints: CHECKPOINTS } = useParcours();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [shown, setShown] = useState<string | null>(null);

  if (!ready) return null;
  const done = stepsDone(progress);
  const consolider = MODULES.filter((m) => moduleState(progress, m) === "a-consolider");

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat value={`${done}/${TOTAL_STEPS}`} label="étapes réalisées" />
        <Stat value={`${MODULES.filter((m) => progress.completed[m.id]).length}/${MODULES.length}`} label="modules terminés" />
        <Stat value={`${CHECKPOINTS.filter((c) => progress.checkpoints[c.id]).length}/${CHECKPOINTS.length}`} label="bilans passés" />
      </div>
      <p className="text-sm text-[var(--color-ink-soft)]">
        La progression compte les étapes réalisées ; elle ne remplace pas une validation par ton professeur, notamment à l&apos;oral.
      </p>

      {consolider.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-coral)]/40 bg-[var(--color-coral)]/8 p-4 text-sm text-[var(--color-ink)]">
          <p className="font-semibold text-[var(--color-coral)]">À consolider avec ton professeur</p>
          <p className="mt-1">{consolider.map((m) => `${m.id} ${m.title}`).join(" · ")}</p>
        </div>
      )}

      <div className="card overflow-hidden rounded-2xl">
        {MODULES.map((m) => {
          const st = moduleState(progress, m);
          const seen = progress.visited[m.id] ?? [];
          return (
            <Link key={m.id} href={`${base}/${m.id}/decouvrir`} className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] px-4 py-3 last:border-0 hover:bg-[var(--color-panel-2)]">
              <span className="w-9 text-xs font-bold text-[var(--color-teal)]">{m.id}</span>
              <span className="min-w-40 flex-1 text-sm font-semibold text-[var(--color-ink)]">{m.title}</span>
              <span className="flex gap-1" aria-label={`${seen.length} étapes sur 6`}>
                {STEPS.map((s) => (
                  <span key={s.id} className={`h-2 w-5 rounded-full ${seen.includes(s.id) ? "bg-[var(--color-teal)]" : "bg-[var(--color-line)]"}`} />
                ))}
              </span>
              <span className="flex gap-1 text-[11px] text-[var(--color-ink-faint)]">
                {progress.copyDeclaredDone[m.id] && <span>copie ✓</span>}
                {progress.listening[m.id] === "read-only" && <span className="text-[var(--color-sun)]">oral non évalué</span>}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATE_STYLE[st]}`}>{STATE_LABELS[st]}</span>
            </Link>
          );
        })}
      </div>

      <div className="card flex flex-col gap-4 rounded-2xl p-5">
        <div>
          <p className="font-semibold text-[var(--color-ink)]">Reprendre sur un autre appareil</p>
          <p className="text-sm text-[var(--color-ink-soft)]">
            Ta progression est gardée sur cet appareil. Pour continuer ailleurs, copie ton code de reprise et colle-le sur l&apos;autre appareil.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              const c = exportCode(progress);
              setShown(c);
              try {
                await navigator.clipboard.writeText(c);
                setMsg({ ok: true, text: "Code copié." });
              } catch {
                setMsg({ ok: true, text: "Sélectionne le code ci-dessous et copie-le." });
              }
            }}
            className="btn btn-primary"
          >
            <Download size={15} /> Obtenir mon code
          </button>
        </div>
        {shown && (
          <div className="flex items-start gap-2">
            <textarea readOnly value={shown} rows={3} className="field font-mono !text-xs" onFocus={(e) => e.currentTarget.select()} />
            <button type="button" onClick={() => navigator.clipboard?.writeText(shown)} className="btn btn-ghost !px-3" aria-label="Copier">
              <Copy size={14} />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Colle ici un code de reprise" className="field flex-1 font-mono !text-xs" />
          <button
            type="button"
            disabled={!code.trim()}
            onClick={() => {
              const p = importCode(code);
              if (!p) return setMsg({ ok: false, text: "Code invalide." });
              if (!confirm("Remplacer la progression de cet appareil par celle du code ?")) return;
              saveProgress(p);
              setCode("");
              setMsg({ ok: true, text: "Progression reprise." });
            }}
            className="btn btn-ghost"
          >
            <Upload size={15} /> Reprendre
          </button>
        </div>
        {msg && <p className={`text-sm ${msg.ok ? "text-[var(--color-teal)]" : "text-[var(--color-coral)]"}`}>{msg.text}</p>}
        <button
          type="button"
          onClick={() => confirm("Effacer toute ta progression sur cet appareil ?") && saveProgress(emptyProgress())}
          className="self-start text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-coral)]"
        >
          <RotateCcw size={12} className="mr-1 inline" /> Tout recommencer
        </button>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card rounded-2xl p-5">
      <p className="text-3xl font-bold text-[var(--color-ink)]">{value}</p>
      <p className="text-sm text-[var(--color-ink-soft)]">{label}</p>
    </div>
  );
}
