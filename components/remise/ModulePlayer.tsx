"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, FileText, LifeBuoy, Volume2, X } from "lucide-react";
import {
  STEPS,
  checkpointAfter,
  nextModule,
  type RemiseModule,
  type StepId,
} from "@/lib/remise/content";
import { useProgress, type AttemptRecord } from "@/lib/remise/progress";
import { useParcours } from "./ParcoursContext";
import QcmPlayer, { type QuestionResult } from "@/components/QcmPlayer";
import AudioBlock from "./AudioBlock";
import ModuleVisual from "./ModuleVisual";
import RichText from "./RichText";
import { useSpeech } from "./useSpeech";

type Drawer = "aide" | "lecon" | "fiche" | null;

export default function ModulePlayer({ module: m, step, base }: { module: RemiseModule; step: StepId; base: string }) {
  const { update } = useProgress();
  const [drawer, setDrawer] = useState<Drawer>(null);
  const { paperPdf } = useParcours();
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const nextStep = STEPS[stepIndex + 1];

  // Mémorise l'étape en cours (reprise au même endroit) et l'étape ouverte.
  useEffect(() => {
    update((p) => {
      const seen = p.visited[m.id] ?? [];
      return {
        ...p,
        currentModule: m.id,
        currentStep: step,
        visited: { ...p.visited, [m.id]: seen.includes(step) ? seen : [...seen, step] },
      };
    });
  }, [m.id, step, update]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 pt-6 pb-28 sm:px-6">
      {/* En haut : retour, code du module, étape sur 6 */}
      <div className="flex items-center gap-3 text-sm">
        <Link href={base} className="inline-flex items-center gap-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
          <ArrowLeft size={15} /> Parcours
        </Link>
        <span className="ml-auto rounded-full bg-[var(--color-teal)]/12 px-2.5 py-0.5 text-xs font-bold text-[var(--color-teal)]">{m.id}</span>
        <span className="text-[var(--color-ink-faint)]">
          Étape {stepIndex + 1}/{STEPS.length}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-ink)]">{m.title}</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">{m.objective}</p>

      <nav className="mt-5 grid grid-cols-6 gap-1.5" aria-label="Étapes">
        {STEPS.map((s, i) => (
          <Link key={s.id} href={`${base}/${m.id}/${s.id}`} className="group flex flex-col gap-1.5" aria-current={s.id === step ? "step" : undefined}>
            <span className={`h-1.5 rounded-full transition ${i < stepIndex ? "bg-[var(--color-teal)]/60" : i === stepIndex ? "bg-[var(--color-teal)]" : "bg-[var(--color-line)] group-hover:bg-[var(--color-ink-faint)]"}`} />
            <span className={`hidden text-[11px] sm:block ${s.id === step ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}>{s.label}</span>
          </Link>
        ))}
      </nav>

      <section key={step} className="rise-in mt-7">
        {step === "decouvrir" && <Decouvrir m={m} />}
        {step === "comprendre" && <Comprendre m={m} />}
        {step === "entrainer" && <Entrainer m={m} openLecon={() => setDrawer("lecon")} />}
        {step === "copier" && <Copier m={m} />}
        {step === "appliquer" && <Appliquer m={m} />}
        {step === "verifier" && <Verifier m={m} base={base} />}
      </section>

      {nextStep && (
        <div className="mt-8 flex justify-end">
          <Link href={`${base}/${m.id}/${nextStep.id}`} className="btn btn-primary">
            {nextStep.label} <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* En bas : les trois accès permanents */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-line)] bg-[var(--color-bg-deep)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-around gap-2 px-4 py-2.5 sm:justify-center sm:gap-4">
          <BarButton icon={<LifeBuoy size={17} />} label="Besoin d'aide" onClick={() => setDrawer("aide")} />
          <BarButton icon={<BookOpen size={17} />} label="Ma leçon" onClick={() => setDrawer("lecon")} />
          <BarButton icon={<FileText size={17} />} label="Ma fiche" onClick={() => setDrawer("fiche")} />
        </div>
      </div>

      {drawer && (
        <Sheet title={drawer === "aide" ? "Besoin d'aide" : drawer === "lecon" ? `Ma leçon — ${m.copyLesson.title}` : `Ma fiche ${m.id}`} onClose={() => setDrawer(null)}>
          {drawer === "aide" && <AideContent m={m} base={base} />}
          {drawer === "lecon" && <LessonLines lines={m.copyLesson.lines} />}
          {drawer === "fiche" && (
            <div className="flex flex-col gap-3 text-sm text-[var(--color-ink-soft)]">
              <p>
                Ta fiche papier {m.id} est la page {m.paperPage} du dossier. Colle-la dans ton cahier, puis recopie la leçon sur la page suivante.
              </p>
              <a href={`${paperPdf}#page=${m.paperPage}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary self-start">
                <FileText size={15} /> Ouvrir la fiche {m.id}
              </a>
            </div>
          )}
        </Sheet>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Étapes

function Consigne({ children }: { children: ReactNode }) {
  return <p className="mb-5 rounded-2xl border-l-4 border-[var(--color-teal)] bg-[var(--color-teal)]/8 px-4 py-3 text-[var(--color-ink)]">{children}</p>;
}

function Decouvrir({ m }: { m: RemiseModule }) {
  return (
    <div className="flex flex-col gap-5">
      <Consigne>
        Prends la fiche {m.id}. Observe le document. Écoute si l&apos;audio est disponible.
      </Consigne>
      <ModuleVisual module={m} />
      <div className="card rounded-2xl p-5">
        <p className="section-label mb-2">Le document</p>
        <p className="text-lg leading-relaxed text-[var(--color-ink)]">
          <RichText text={m.documentHtml} />
        </p>
      </div>
      <AudioBlock module={m} />
    </div>
  );
}

function Comprendre({ m }: { m: RemiseModule }) {
  const [i, setI] = useState(0);
  const card = m.understandCards[i];
  const { speak, supported } = useSpeech();
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <Consigne>Lis les repères un par un. Clique sur un mot du lexique pour voir sa traduction et l&apos;entendre.</Consigne>
      <div className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--color-teal)]">{card.title}</p>
          <p className="text-xs text-[var(--color-ink-faint)]">
            {i + 1}/{m.understandCards.length}
          </p>
        </div>
        <p className="prose-lite mt-3 text-lg text-[var(--color-ink)]">{card.text}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => setI(i - 1)} disabled={i === 0} className="btn btn-ghost !py-2">
            <ChevronLeft size={15} /> Précédent
          </button>
          <button type="button" onClick={() => setI(i + 1)} disabled={i === m.understandCards.length - 1} className="btn btn-ghost !py-2">
            Suivant <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div>
        <p className="section-label mb-2">Lexique</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(m.glossary).map((es) => (
            <button
              key={es}
              type="button"
              onClick={() => {
                setPicked(es);
                if (supported) speak(es, 0.85);
              }}
              className={`chip !text-sm ${picked === es ? "chip-on" : ""}`}
            >
              {es}
            </button>
          ))}
        </div>
        {picked && (
          <p className="rise-in mt-3 flex items-center gap-2 text-[var(--color-ink)]">
            <span className="font-semibold">{picked}</span> = <span className="text-[var(--color-ink-soft)]">{m.glossary[picked]}</span>
            {supported && (
              <button type="button" onClick={() => speak(picked, 0.85)} className="text-[var(--color-teal)]" aria-label="Réécouter">
                <Volume2 size={16} />
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function toAttempt(r: QuestionResult): AttemptRecord {
  return { firstTry: r.firstTry, errors: r.errors, helped: r.helped, consolider: r.consolider };
}

function Entrainer({ m, openLecon }: { m: RemiseModule; openLecon: () => void }) {
  const { update } = useProgress();
  const training = m.activities.filter((a) => a.phase === "training");
  return (
    <div className="flex flex-col gap-5">
      <Consigne>{training.length} questions, une par écran. Si tu te trompes, un indice t&apos;aide ; aucune pénalité de vitesse.</Consigne>
      <div className="card rounded-2xl p-5 sm:p-7">
        <QcmPlayer
          questions={training}
          helpSlot={
            <button type="button" onClick={openLecon} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-teal)]">
              <BookOpen size={14} /> Revoir ma leçon
            </button>
          }
          onComplete={(results) =>
            update((p) => {
              const attempts = { ...p.attempts };
              results.forEach((r, i) => (attempts[training[i].id] = toAttempt(r)));
              return { ...p, attempts };
            })
          }
        />
      </div>
    </div>
  );
}

function LessonLines({ lines, big = false }: { lines: string[]; big?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 ${big ? "text-xl leading-relaxed" : "text-base leading-relaxed"} text-[var(--color-ink)]`}>
      {lines.map((l, i) => (
        <p key={i}>
          <RichText text={l} />
        </p>
      ))}
    </div>
  );
}

function Copier({ m }: { m: RemiseModule }) {
  const { progress, update } = useProgress();
  const [all, setAll] = useState(false);
  const [block, setBlock] = useState(0);
  const size = 3;
  const blocks = Math.ceil(m.copyLesson.lines.length / size);
  const done = !!progress.copyDeclaredDone[m.id];

  return (
    <div className="flex flex-col gap-5">
      <Consigne>{m.copyInstruction}</Consigne>
      <div className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-xl font-bold text-[var(--color-ink)]">{m.copyLesson.title}</p>
          <button type="button" onClick={() => setAll(!all)} className="chip ml-auto">
            {all ? "Bloc par bloc" : "Toute la leçon"}
          </button>
        </div>
        {all ? (
          <LessonLines lines={m.copyLesson.lines} big />
        ) : (
          <>
            <LessonLines lines={m.copyLesson.lines.slice(block * size, block * size + size)} big />
            <div className="mt-5 flex items-center gap-2">
              <button type="button" onClick={() => setBlock(block - 1)} disabled={block === 0} className="btn btn-ghost !py-2">
                <ChevronLeft size={15} /> Bloc précédent
              </button>
              <span className="text-xs text-[var(--color-ink-faint)]">
                {block + 1}/{blocks}
              </span>
              <button type="button" onClick={() => setBlock(block + 1)} disabled={block >= blocks - 1} className="btn btn-ghost !py-2">
                Bloc suivant <ChevronRight size={15} />
              </button>
            </div>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => update((p) => ({ ...p, copyDeclaredDone: { ...p.copyDeclaredDone, [m.id]: !done } }))}
        className={`btn self-start ${done ? "btn-ghost" : "btn-primary"}`}
      >
        {done ? <Check size={15} /> : null} {done ? "Copie déclarée — compare accents, verbes et ponctuation" : "J'ai recopié et relu"}
      </button>
    </div>
  );
}

function PaperTasks({ m }: { m: RemiseModule }) {
  return (
    <ol className="flex flex-col gap-3">
      {m.paperTasks.map(([title, text], i) => (
        <li key={i} className="card rounded-2xl p-4">
          <p className="font-semibold text-[var(--color-teal)]">
            {i + 1} • {title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]">
            <RichText text={text} />
          </p>
        </li>
      ))}
    </ol>
  );
}

function Appliquer({ m }: { m: RemiseModule }) {
  const { progress, update } = useProgress();
  const used = progress.missions[m.id]?.helpUsed ?? 0;
  const revealHelp = (n: number) =>
    update((p) => {
      const cur = p.missions[m.id] ?? { done: false, helpUsed: 0, selfEval: [] };
      return { ...p, missions: { ...p.missions, [m.id]: { ...cur, helpUsed: Math.max(cur.helpUsed, n) } } };
    });

  return (
    <div className="flex flex-col gap-5">
      <Consigne>{m.paperInstruction}</Consigne>
      <PaperTasks m={m} />
      <div className="card rounded-2xl p-4">
        <p className="font-semibold text-[var(--color-sun)]">{m.paperTasks.length + 1} • Ma mission</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]">{m.mission}</p>
        <div className="mt-4 flex flex-col gap-2">
          {m.help.map((h, i) =>
            used > i ? (
              <p key={i} className="rise-in rounded-xl bg-[var(--color-sun)]/10 px-3 py-2 text-sm text-[var(--color-ink)]">
                <span className="font-semibold text-[var(--color-sun)]">Aide {i + 1} :</span> {h}
              </p>
            ) : (
              used === i && (
                <button key={i} type="button" onClick={() => revealHelp(i + 1)} className="btn btn-ghost self-start !py-2 !text-xs">
                  <LifeBuoy size={14} /> Aide {i + 1}
                </button>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Verifier({ m, base }: { m: RemiseModule; base: string }) {
  const router = useRouter();
  const { progress, update } = useProgress();
  const exit = m.activities.filter((a) => a.phase === "exit");
  const exitDone = exit.every((a) => progress.attempts[a.id]);
  const corrected = !!progress.paperDeclaredCorrected[m.id];
  const mission = progress.missions[m.id] ?? { done: false, helpUsed: 0, selfEval: [] };
  const parcours = useParcours();
  const checkpoint = checkpointAfter(parcours, m.id);
  const next = nextModule(parcours, m.id);

  function finish() {
    update((p) => ({
      ...p,
      completed: { ...p.completed, [m.id]: true },
      currentModule: next && !checkpoint ? next.id : p.currentModule,
      currentStep: next && !checkpoint ? "decouvrir" : p.currentStep,
    }));
    if (checkpoint) router.push(`${base}/bilans/${checkpoint.id}`);
    else if (next) router.push(`${base}/${next.id}/decouvrir`);
    else router.push(base);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-label mb-2">Question de sortie</p>
        <div className="card rounded-2xl p-5 sm:p-6">
          <QcmPlayer
            questions={exit}
            summary={false}
            onComplete={(results) =>
              update((p) => {
                const attempts = { ...p.attempts };
                results.forEach((r, i) => (attempts[exit[i].id] = toAttempt(r)));
                return { ...p, attempts };
              })
            }
          />
          {exitDone && <p className="mt-2 text-sm text-[var(--color-teal)]">Question de sortie faite.</p>}
        </div>
      </div>

      <div>
        <p className="section-label mb-2">Correction de ta fiche</p>
        <div className="card rounded-2xl p-5">
          {corrected ? (
            <ol className="flex flex-col gap-2 text-sm text-[var(--color-ink)]">
              {m.paperSolutions.map((s, i) => (
                <li key={i}>
                  <span className="font-semibold text-[var(--color-teal)]">{i + 1}.</span> {s}
                </li>
              ))}
              <li className="mt-1 text-[var(--color-ink-soft)]">Corrige ta fiche dans une autre couleur.</li>
            </ol>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-[var(--color-ink-soft)]">Complète d&apos;abord les activités 1 et 2 de ta fiche, sans regarder.</p>
              <button type="button" onClick={() => update((p) => ({ ...p, paperDeclaredCorrected: { ...p.paperDeclaredCorrected, [m.id]: true } }))} className="btn btn-primary">
                J&apos;ai essayé, voir la correction
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="section-label mb-2">Ma mission</p>
        <div className="card rounded-2xl p-5">
          {mission.done ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-sun)]">Un exemple possible</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]">{m.model}</p>
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">Une réponse différente peut être juste.</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">Je vérifie</p>
                <div className="mt-2 flex flex-col gap-2">
                  {m.criteria.map((c, i) => (
                    <label key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
                      <input
                        type="checkbox"
                        checked={!!mission.selfEval[i]}
                        onChange={(e) =>
                          update((p) => {
                            const cur = p.missions[m.id] ?? { done: true, helpUsed: 0, selfEval: [] };
                            const selfEval = [...cur.selfEval];
                            selfEval[i] = e.target.checked;
                            return { ...p, missions: { ...p.missions, [m.id]: { ...cur, selfEval } } };
                          })
                        }
                        className="mt-0.5 h-4 w-4 accent-[var(--color-teal)]"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-[var(--color-ink-soft)]">{m.mission}</p>
              <button
                type="button"
                onClick={() => update((p) => ({ ...p, missions: { ...p.missions, [m.id]: { ...mission, done: true } } }))}
                className="btn btn-primary"
              >
                J&apos;ai écrit ma mission
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 border-t border-[var(--color-line)] pt-6">
        <button type="button" onClick={finish} disabled={!exitDone} className="btn btn-primary">
          {checkpoint ? `Terminer et passer le bilan ${checkpoint.id}` : next ? `Terminer et passer à ${next.id}` : "Terminer le parcours"} <ArrowRight size={15} />
        </button>
        {!exitDone && <p className="text-xs text-[var(--color-ink-faint)]">Réponds d&apos;abord à la question de sortie.</p>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Aide & tiroirs

function AideContent({ m, base }: { m: RemiseModule; base: string }) {
  return (
    <div className="flex flex-col gap-3 text-sm text-[var(--color-ink)]">
      {m.help.map((h, i) => (
        <p key={i} className="rounded-xl bg-[var(--color-sun)]/10 px-3 py-2">
          <span className="font-semibold text-[var(--color-sun)]">Aide {i + 1} :</span> {h}
        </p>
      ))}
      <p className="text-[var(--color-ink-soft)]">
        Tu peux aussi relire ta leçon ou les <Link href={`${base}/memos`} className="text-[var(--color-teal)] underline">mémos</Link>. Si tu bloques encore, note ta question pour ton
        professeur.
      </p>
      <p className="rounded-xl border border-[var(--color-line)] px-3 py-2 text-[var(--color-ink-soft)]">
        À l&apos;oral : <span className="text-[var(--color-ink)]">No entiendo. ¿Puedes repetir?</span>
      </p>
    </div>
  );
}

function BarButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-[var(--color-ink-soft)] transition hover:text-[var(--color-teal)] sm:flex-row sm:gap-2 sm:border sm:border-[var(--color-line)] sm:px-4 sm:py-2">
      {icon}
      <span className="text-[11px] font-medium sm:text-sm">{label}</span>
    </button>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="rise-in relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">{title}</h2>
          <button type="button" onClick={onClose} className="ml-auto rounded-lg p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
