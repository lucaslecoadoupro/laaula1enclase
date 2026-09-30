// Validation des contenus envoyés par l'éditeur admin.
import type { Activity, Checkpoint, CheckpointQuestion, RemiseModule } from "./content";
import { MODULE_IDS } from "./content";

const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.slice(0, max) : "");
const strList = (v: unknown, maxItems = 40, max = 1000) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, maxItems).map((x) => x.slice(0, max)) : [];

function question(raw: unknown, id: string) {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;
  const options = strList(q.options, 6, 300).filter((o) => o.trim());
  if (options.length < 2 || !str(q.prompt).trim()) return null;
  const ci = typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < options.length ? q.correctIndex : 0;
  return { type: "single_choice", prompt: str(q.prompt, 500), options, correctIndex: ci, hint: str(q.hint, 500), explanation: str(q.explanation, 1000), id };
}

function questions(raw: unknown, prefix: string, phase: "training" | "exit", start = 0): Activity[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 20)
    .map((q) => question(q, ""))
    .filter((q): q is NonNullable<typeof q> => !!q)
    .map((q, i) => ({ ...q, id: `${prefix}${String(start + i + 1).padStart(2, "0")}`, phase }));
}

export function sanitizeModule(raw: unknown, base: RemiseModule): RemiseModule | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const title = str(m.title, 120).trim();
  if (!title) return null;

  const a = (m.audio ?? {}) as Record<string, unknown>;
  const src = typeof a.src === "string" && (a.src.startsWith("https://") || a.src.startsWith("/")) ? a.src.slice(0, 1000) : null;

  const glossary: Record<string, string> = {};
  if (m.glossary && typeof m.glossary === "object") {
    for (const [k, v] of Object.entries(m.glossary as Record<string, unknown>).slice(0, 60)) {
      if (k.trim() && typeof v === "string") glossary[k.trim().slice(0, 120)] = v.slice(0, 300);
    }
  }

  const cards = Array.isArray(m.understandCards)
    ? (m.understandCards as unknown[])
        .slice(0, 10)
        .map((c) => (c && typeof c === "object" ? { title: str((c as Record<string, unknown>).title, 120), text: str((c as Record<string, unknown>).text, 3000) } : null))
        .filter((c): c is { title: string; text: string } => !!c && !!(c.title.trim() || c.text.trim()))
    : [];

  const tasks: [string, string, number][] = Array.isArray(m.paperTasks)
    ? (m.paperTasks as unknown[]).slice(0, 6).map((t) => {
        const arr = Array.isArray(t) ? t : [];
        return [str(arr[0], 200), str(arr[1], 2000), typeof arr[2] === "number" ? Math.max(0, Math.min(10, arr[2])) : 0];
      })
    : [];

  const cl = (m.copyLesson ?? {}) as Record<string, unknown>;
  // Identifiants comme dans le kit : S01-E01… pour l'entraînement, puis la sortie à la suite (S01-E05).
  const all = Array.isArray(m.activities) ? (m.activities as Record<string, unknown>[]) : [];
  const training = questions(all.filter((x) => x?.phase !== "exit"), `${base.id}-E`, "training");
  const exit = questions(all.filter((x) => x?.phase === "exit"), `${base.id}-E`, "exit", training.length);
  const activities = [...training, ...exit];

  return {
    ...base,
    title,
    objective: str(m.objective, 300),
    documentHtml: str(m.documentHtml, 4000),
    visual: ["bureau", "loisirs", "numbers", "calendar", "clocks", "none"].includes(str(m.visual)) ? str(m.visual) : base.visual,
    audio: { id: base.audio.id, src, status: src ? "recorded" : "to_record", transcript: str(a.transcript, 3000) },
    understandCards: cards,
    glossary,
    copyLesson: { title: str(cl.title, 120) || title, lines: strList(cl.lines, 20, 600).filter((l) => l.trim()) },
    copyInstruction: str(m.copyInstruction, 1000),
    paperInstruction: str(m.paperInstruction, 1000),
    paperTasks: tasks,
    paperSolutions: strList(m.paperSolutions, 6, 2000),
    mission: str(m.mission, 2000),
    model: str(m.model, 2000),
    criteria: strList(m.criteria, 6, 300).filter((c) => c.trim()),
    help: strList(m.help, 4, 500).filter((h) => h.trim()),
    activities,
    teachingNote: str(m.teachingNote, 2000),
  };
}

function cpQuestions(raw: unknown, prefix: string): CheckpointQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 10)
    .map((q, i) => {
      const base = question(q, `${prefix}${i + 1}`);
      if (!base) return null;
      const rm = str((q as Record<string, unknown>).reviewModule);
      const out: CheckpointQuestion = { ...base, phase: "training", reviewModule: MODULE_IDS.includes(rm) ? rm : MODULE_IDS[0] };
      return out;
    })
    .filter((q): q is CheckpointQuestion => q !== null);
}

export function sanitizeCheckpoint(raw: unknown, base: Checkpoint): Checkpoint | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const qs = cpQuestions(c.questions, `${base.id}-Q`);
  const retry = cpQuestions(c.retry, `${base.id}-R`);
  if (qs.length === 0) return null;
  const threshold = typeof c.threshold === "number" ? Math.max(1, Math.min(qs.length, Math.round(c.threshold))) : Math.min(base.threshold, qs.length);
  return { ...base, questions: qs, retry: retry.length ? retry : qs, maxScore: qs.length, threshold };
}
