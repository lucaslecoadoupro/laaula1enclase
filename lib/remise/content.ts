// Contenus du parcours « Conexión español ».
// Le kit V2 (parcours.json) sert de base ; le professeur peut modifier chaque
// module / bilan depuis /admin/remise (voir repo.ts). Ces fonctions sont pures
// et prennent le parcours en paramètre : importables côté client et serveur.
import data from "./parcours.json";
import type { QcmQuestion } from "@/lib/qcm";

export type Activity = QcmQuestion & { id: string; phase: "training" | "exit"; type: string };
export type CheckpointQuestion = Activity & { reviewModule: string };

export type RemiseModule = {
  id: string;
  title: string;
  objective: string;
  paperPage: number;
  documentHtml: string;
  copyLesson: { title: string; lines: string[] };
  paperTasks: [string, string, number][];
  paperSolutions: string[];
  mission: string;
  model: string;
  criteria: string[];
  help: string[];
  activities: Activity[];
  audio: { id: string; src: string | null; status: string; transcript: string };
  teachingNote: string;
  visual: string;
  copyInstruction: string;
  paperInstruction: string;
  glossary: Record<string, string>;
  understandCards: { title: string; text: string }[];
};

export type Checkpoint = {
  id: string;
  afterModule: string;
  threshold: number;
  maxScore: number;
  questions: CheckpointQuestion[];
  retry: CheckpointQuestion[];
};

export type Memos = { hundreds: string[]; essentialVerbs: Record<string, string[]>; order: string[] };
export type Clocks = { module: string; clocks: { label: string; hour: number; minute: number }[] };

export type Parcours = {
  modules: RemiseModule[];
  checkpoints: Checkpoint[];
  memos: Memos;
  clocks: Clocks;
  /** URL du dossier élève (PDF des fiches). */
  paperPdf: string;
};

export const STEPS = [
  { id: "decouvrir", label: "Découvrir" },
  { id: "comprendre", label: "Comprendre" },
  { id: "entrainer", label: "S'entraîner" },
  { id: "copier", label: "Copier" },
  { id: "appliquer", label: "Appliquer" },
  { id: "verifier", label: "Vérifier" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export const VISUALS = [
  { id: "bureau", label: "Illustration : bureau" },
  { id: "loisirs", label: "Illustration : loisirs" },
  { id: "numbers", label: "Dessin : nombres" },
  { id: "calendar", label: "Dessin : calendrier" },
  { id: "clocks", label: "Dessin : horloges" },
  { id: "none", label: "Aucun visuel" },
];

export const DEFAULT_PARCOURS: Parcours = {
  modules: data.modules as unknown as RemiseModule[],
  checkpoints: data.checkpoints as unknown as Checkpoint[],
  memos: data.memos as Memos,
  clocks: data.clockExercise as Clocks,
  paperPdf: "/remise/Conexion_espanol_Dossier_eleve.pdf",
};

/** Identifiants fixes : 12 modules et 3 bilans (la structure du parcours ne change pas). */
export const MODULE_IDS = DEFAULT_PARCOURS.modules.map((m) => m.id);
export const CHECKPOINT_IDS = DEFAULT_PARCOURS.checkpoints.map((c) => c.id);

export function findModule(p: Parcours, id: string) {
  return p.modules.find((m) => m.id === id) ?? null;
}

export function findCheckpoint(p: Parcours, id: string) {
  return p.checkpoints.find((c) => c.id === id) ?? null;
}

export function checkpointAfter(p: Parcours, moduleId: string) {
  return p.checkpoints.find((c) => c.afterModule === moduleId) ?? null;
}

export function nextModule(p: Parcours, moduleId: string) {
  const i = p.modules.findIndex((m) => m.id === moduleId);
  return i >= 0 && i + 1 < p.modules.length ? p.modules[i + 1] : null;
}

export function isStep(s: string): s is StepId {
  return STEPS.some((x) => x.id === s);
}

/** Illustration du kit associée au module (les autres visuels sont dessinés). */
export function visualImage(visual: string) {
  return visual === "bureau" || visual === "loisirs" ? `/remise/${visual}.webp` : null;
}
