"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { VISUALS, type Activity, type RemiseModule } from "@/lib/remise/content";
import FileUploader from "./FileUploader";
import QuestionsEditor, { type EditableQuestion } from "./QuestionsEditor";
import SaveBar from "./SaveBar";
import { cleanQuestions } from "./QcmEditor";

/** Les contenus du kit utilisent <br/> ; dans l'éditeur on travaille avec de vrais retours à la ligne. */
const toText = (s: string) => s.replace(/<br\s*\/?>/gi, "\n");
const toHtml = (s: string) => s.replace(/\r?\n/g, "<br/>");
const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim());

type Draft = {
  title: string;
  objective: string;
  visual: string;
  document: string;
  audioSrc: string | null;
  transcript: string;
  cards: { title: string; text: string }[];
  glossary: { es: string; fr: string }[];
  training: EditableQuestion[];
  exit: EditableQuestion[];
  lessonTitle: string;
  lessonLines: string;
  copyInstruction: string;
  paperInstruction: string;
  tasks: { title: string; text: string; lines: number }[];
  solutions: string[];
  mission: string;
  help: string;
  model: string;
  criteria: string;
  teachingNote: string;
};

function toDraft(m: RemiseModule): Draft {
  const q = (a: Activity): EditableQuestion => ({ prompt: a.prompt, options: [...a.options], correctIndex: a.correctIndex, hint: a.hint, explanation: a.explanation });
  return {
    title: m.title,
    objective: m.objective,
    visual: m.visual,
    document: toText(m.documentHtml),
    audioSrc: m.audio.src,
    transcript: m.audio.transcript,
    cards: m.understandCards.map((c) => ({ ...c })),
    glossary: Object.entries(m.glossary).map(([es, fr]) => ({ es, fr })),
    training: m.activities.filter((a) => a.phase !== "exit").map(q),
    exit: m.activities.filter((a) => a.phase === "exit").map(q),
    lessonTitle: m.copyLesson.title,
    lessonLines: m.copyLesson.lines.join("\n"),
    copyInstruction: m.copyInstruction,
    paperInstruction: m.paperInstruction,
    tasks: m.paperTasks.map(([title, text, n]) => ({ title, text: toText(text), lines: n })),
    solutions: m.paperTasks.map((_, i) => m.paperSolutions[i] ?? ""),
    mission: m.mission,
    help: m.help.join("\n"),
    model: m.model,
    criteria: m.criteria.join("\n"),
    teachingNote: m.teachingNote,
  };
}

function toModule(d: Draft) {
  return {
    title: d.title,
    objective: d.objective,
    visual: d.visual,
    documentHtml: toHtml(d.document.trim()),
    audio: { src: d.audioSrc, transcript: d.transcript.trim() },
    understandCards: d.cards,
    glossary: Object.fromEntries(d.glossary.filter((g) => g.es.trim()).map((g) => [g.es.trim(), g.fr.trim()])),
    activities: [
      ...cleanQuestions(d.training).map((q) => ({ ...q, phase: "training" })),
      ...cleanQuestions(d.exit).map((q) => ({ ...q, phase: "exit" })),
    ],
    copyLesson: { title: d.lessonTitle, lines: lines(d.lessonLines) },
    copyInstruction: d.copyInstruction,
    paperInstruction: d.paperInstruction,
    paperTasks: d.tasks.map((t) => [t.title, toHtml(t.text.trim()), t.lines]),
    paperSolutions: d.solutions.slice(0, d.tasks.length),
    mission: d.mission,
    help: lines(d.help),
    model: d.model,
    criteria: lines(d.criteria),
    teachingNote: d.teachingNote,
  };
}

const SECTIONS = [
  { id: "presentation", label: "Présentation" },
  { id: "decouvrir", label: "1. Découvrir" },
  { id: "comprendre", label: "2. Comprendre" },
  { id: "entrainer", label: "3. S'entraîner" },
  { id: "copier", label: "4. Copier" },
  { id: "appliquer", label: "5. Appliquer" },
  { id: "verifier", label: "6. Vérifier" },
];

export default function ModuleEditor({ module: m, modified }: { module: RemiseModule; modified: boolean }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(m));
  const [saved, setSaved] = useState(() => JSON.stringify(toDraft(m)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== saved;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function save(nextDraft = draft) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/remise/modules/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: toModule(nextDraft) }),
    });
    setBusy(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Erreur lors de l'enregistrement.");
      return false;
    }
    const fresh = toDraft(data.module);
    setDraft(fresh);
    setSaved(JSON.stringify(fresh));
    router.refresh();
    return true;
  }

  async function reset() {
    if (!confirm(`Remettre ${m.id} dans sa version d'origine (kit Conexión) ? Tes modifications et l'audio envoyé seront effacés.`)) return;
    setBusy(true);
    await fetch(`/api/admin/remise/modules/${m.id}`, { method: "DELETE" });
    setSaved(JSON.stringify(draft)); // évite l'alerte « modifications non enregistrées »
    setTimeout(() => window.location.reload(), 50);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
      <nav className="hidden lg:block">
        <div className="sticky top-6 flex flex-col gap-1 text-sm">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-lg px-3 py-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="flex min-w-0 flex-col gap-6">
        <Section id="presentation" title="Présentation">
          <Field label="Titre du module">
            <input value={draft.title} onChange={(e) => set("title", e.target.value)} className="field !text-base font-semibold" />
          </Field>
          <Field label="Objectif (« Je… »)">
            <input value={draft.objective} onChange={(e) => set("objective", e.target.value)} className="field" />
          </Field>
          <Field label="Visuel affiché à l'étape Découvrir">
            <select value={draft.visual} onChange={(e) => set("visual", e.target.value)} className="field">
              {VISUALS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Note pour toi (jamais affichée aux élèves)">
            <textarea value={draft.teachingNote} onChange={(e) => set("teachingNote", e.target.value)} rows={2} className="field resize-y" />
          </Field>
        </Section>

        <Section id="decouvrir" title="1. Découvrir" hint="Le document de la fiche et son audio.">
          <Field label="Le document (un retour à la ligne = une ligne ; <b>texte</b> pour du gras)">
            <textarea value={draft.document} onChange={(e) => set("document", e.target.value)} rows={6} className="field resize-y font-medium" />
          </Field>
          <Field label={`Audio ${m.audio.id}`}>
            <FileUploader
              label="l'audio"
              folder="remise/audio"
              accept="audio/*,.mp3,.m4a,.wav,.ogg"
              value={
                draft.audioSrc
                  ? { url: draft.audioSrc, pathname: draft.audioSrc, contentType: "audio/mpeg", taille: 0, nom: `Enregistrement ${m.audio.id}` }
                  : null
              }
              onChange={async (f) => {
                const next = { ...draft, audioSrc: f?.url ?? null };
                setDraft(next);
                await save(next);
              }}
            />
            {draft.audioSrc ? (
              <audio src={draft.audioSrc} controls className="mt-2 w-full" />
            ) : (
              <p className="mt-1 text-xs text-[var(--color-ink-faint)]">Sans enregistrement, les élèves ont la voix de synthèse du navigateur et la transcription.</p>
            )}
          </Field>
          <Field label="Transcription de l'audio">
            <textarea value={draft.transcript} onChange={(e) => set("transcript", e.target.value)} rows={3} className="field resize-y" />
          </Field>
        </Section>

        <Section id="comprendre" title="2. Comprendre" hint="Les repères s'affichent un par un, puis le lexique cliquable.">
          {draft.cards.map((c, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-3">
              <div className="flex gap-2">
                <input
                  value={c.title}
                  onChange={(e) => set("cards", draft.cards.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                  placeholder={`Repère ${i + 1}`}
                  className="field flex-1 font-semibold"
                />
                <RemoveButton onClick={() => set("cards", draft.cards.filter((_, j) => j !== i))} />
              </div>
              <textarea
                value={c.text}
                onChange={(e) => set("cards", draft.cards.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                rows={3}
                className="field mt-2 resize-y"
              />
            </div>
          ))}
          <AddButton onClick={() => set("cards", [...draft.cards, { title: `Repère ${draft.cards.length + 1}`, text: "" }])} label="Ajouter un repère" />

          <p className="section-label mt-3">Lexique (espagnol → français)</p>
          {draft.glossary.map((g, i) => (
            <div key={i} className="flex gap-2">
              <input value={g.es} onChange={(e) => set("glossary", draft.glossary.map((x, j) => (j === i ? { ...x, es: e.target.value } : x)))} placeholder="hola" className="field flex-1 font-semibold" />
              <input value={g.fr} onChange={(e) => set("glossary", draft.glossary.map((x, j) => (j === i ? { ...x, fr: e.target.value } : x)))} placeholder="salut" className="field flex-1" />
              <RemoveButton onClick={() => set("glossary", draft.glossary.filter((_, j) => j !== i))} />
            </div>
          ))}
          <AddButton onClick={() => set("glossary", [...draft.glossary, { es: "", fr: "" }])} label="Ajouter un mot" />
        </Section>

        <Section id="entrainer" title="3. S'entraîner" hint="Questions à choix unique, une par écran, avec indice puis explication.">
          <QuestionsEditor value={draft.training} onChange={(v) => set("training", v)} />
        </Section>

        <Section id="copier" title="4. Copier" hint="La leçon que l'élève recopie dans son cahier, affichée par blocs de 3 lignes.">
          <Field label="Titre de la leçon">
            <input value={draft.lessonTitle} onChange={(e) => set("lessonTitle", e.target.value)} className="field font-semibold" />
          </Field>
          <Field label="Lignes de la leçon (une par ligne)">
            <textarea value={draft.lessonLines} onChange={(e) => set("lessonLines", e.target.value)} rows={8} className="field resize-y leading-relaxed" />
          </Field>
          <Field label="Consigne de copie">
            <textarea value={draft.copyInstruction} onChange={(e) => set("copyInstruction", e.target.value)} rows={2} className="field resize-y" />
          </Field>
        </Section>

        <Section id="appliquer" title="5. Appliquer" hint="Les activités de la fiche papier et la mission.">
          <Field label="Consigne">
            <textarea value={draft.paperInstruction} onChange={(e) => set("paperInstruction", e.target.value)} rows={2} className="field resize-y" />
          </Field>
          {draft.tasks.map((t, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--color-teal)]">{i + 1}</span>
                <input value={t.title} onChange={(e) => set("tasks", draft.tasks.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Je repère" className="field flex-1 font-semibold" />
                <RemoveButton
                  onClick={() => {
                    setDraft((d) => ({ ...d, tasks: d.tasks.filter((_, j) => j !== i), solutions: d.solutions.filter((_, j) => j !== i) }));
                  }}
                />
              </div>
              <textarea value={t.text} onChange={(e) => set("tasks", draft.tasks.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} rows={3} className="field mt-2 resize-y" />
            </div>
          ))}
          <AddButton
            onClick={() => setDraft((d) => ({ ...d, tasks: [...d.tasks, { title: "", text: "", lines: 0 }], solutions: [...d.solutions, ""] }))}
            label="Ajouter une activité"
          />
          <Field label="Ma mission">
            <textarea value={draft.mission} onChange={(e) => set("mission", e.target.value)} rows={3} className="field resize-y" />
          </Field>
          <Field label="Aides progressives (une par ligne : Aide 1, Aide 2…)">
            <textarea value={draft.help} onChange={(e) => set("help", e.target.value)} rows={2} className="field resize-y" />
          </Field>
        </Section>

        <Section id="verifier" title="6. Vérifier" hint="Question de sortie, correction de la fiche, modèle de mission et autoévaluation.">
          <p className="section-label">Question de sortie</p>
          <QuestionsEditor value={draft.exit} onChange={(v) => set("exit", v)} addLabel="Ajouter une question de sortie" max={3} />
          <p className="section-label mt-3">Correction de la fiche</p>
          {draft.tasks.map((t, i) => (
            <Field key={i} label={`Activité ${i + 1}${t.title ? ` — ${t.title}` : ""}`}>
              <textarea value={draft.solutions[i] ?? ""} onChange={(e) => set("solutions", draft.tasks.map((_, j) => (j === i ? e.target.value : draft.solutions[j] ?? "")))} rows={2} className="field resize-y" />
            </Field>
          ))}
          <Field label="Mission : exemple possible (montré après l'essai)">
            <textarea value={draft.model} onChange={(e) => set("model", e.target.value)} rows={3} className="field resize-y" />
          </Field>
          <Field label="Autoévaluation (un critère par ligne)">
            <textarea value={draft.criteria} onChange={(e) => set("criteria", e.target.value)} rows={2} className="field resize-y" />
          </Field>
        </Section>

        <SaveBar
          dirty={dirty}
          busy={busy}
          error={error}
          onSave={() => save()}
          label="Enregistrer le module"
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
    </div>
  );
}

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} className="card flex scroll-mt-6 flex-col gap-4 rounded-3xl p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-ink)]">{title}</h2>
        {hint && <p className="text-sm text-[var(--color-ink-soft)]">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="section-label">{label}</span>
      {children}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="self-start text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-teal)]">
      <Plus size={14} className="mr-1 inline" />
      {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded p-2 text-[var(--color-ink-faint)] hover:text-[var(--color-coral)]" aria-label="Supprimer">
      <Trash2 size={15} />
    </button>
  );
}
