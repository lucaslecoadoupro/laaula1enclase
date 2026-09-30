import { CheckCircle2, ChevronRight } from "lucide-react";
import type { CorrectionBloc } from "@/lib/corrections-repo";

/** Blocs de corrigé dévoilés à la classe, repliés par défaut pour que l'élève cherche d'abord. */
export default function CorrectionColumn({ blocs }: { blocs: CorrectionBloc[] }) {
  return (
    <aside className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={19} className="text-[var(--color-teal)]" />
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Corrigé</h2>
      </div>
      <p className="text-sm text-[var(--color-ink-soft)]">Cherche d&apos;abord par toi-même, puis ouvre le corrigé pour vérifier.</p>
      {blocs.map((bloc, i) => (
        <details key={bloc.id} className="group card rounded-2xl">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal)]/15 text-xs font-bold text-[var(--color-teal)]">
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-semibold text-[var(--color-ink)]">{bloc.titre || `Partie ${i + 1}`}</span>
            <ChevronRight size={16} className="text-[var(--color-ink-faint)] transition group-open:rotate-90" />
          </summary>
          {bloc.contenu && (
            <div className="prose-lite border-t border-[var(--color-line)] px-4 py-3.5 text-sm text-[var(--color-ink)]">{bloc.contenu}</div>
          )}
        </details>
      ))}
    </aside>
  );
}
