"use client";

// Progression de la Remise à niveau, gardée sur l'appareil de l'élève
// (schéma v2 du kit, complété). Aucune donnée n'est envoyée au serveur.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { CHECKPOINT_IDS, MODULE_IDS, STEPS, type RemiseModule, type StepId } from "./content";

const KEY = "conexion-espanol-progress-v2";

export type AttemptRecord = { firstTry: boolean; errors: number; helped: boolean; consolider: boolean };
export type CheckpointRecord = { score: number; max: number; helped: boolean; passed: boolean; retryScore?: number; at: string };

export type Progress = {
  schemaVersion: 2;
  contentVersion: string;
  currentModule: string;
  currentStep: StepId;
  attempts: Record<string, AttemptRecord>;
  copyDeclaredDone: Record<string, boolean>;
  paperDeclaredCorrected: Record<string, boolean>;
  missions: Record<string, { done: boolean; helpUsed: number; selfEval: boolean[] }>;
  checkpoints: Record<string, CheckpointRecord>;
  oralObserved: boolean;
  /** Étapes ouvertes par module. */
  visited: Record<string, StepId[]>;
  /** Module terminé (étape Vérifier validée). */
  completed: Record<string, boolean>;
  /** Audio : écouté avant de lire la transcription ? */
  listening: Record<string, "listened" | "read-only">;
};

export function emptyProgress(): Progress {
  return {
    schemaVersion: 2,
    contentVersion: "2.0",
    currentModule: MODULE_IDS[0],
    currentStep: "decouvrir",
    attempts: {},
    copyDeclaredDone: {},
    paperDeclaredCorrected: {},
    missions: {},
    checkpoints: {},
    oralObserved: false,
    visited: {},
    completed: {},
    listening: {},
  };
}

function normalize(raw: unknown): Progress {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Progress>;
  return {
    ...base,
    ...p,
    schemaVersion: 2,
    attempts: { ...(p.attempts ?? {}) },
    copyDeclaredDone: { ...(p.copyDeclaredDone ?? {}) },
    paperDeclaredCorrected: { ...(p.paperDeclaredCorrected ?? {}) },
    missions: { ...(p.missions ?? {}) },
    checkpoints: { ...(p.checkpoints ?? {}) },
    visited: { ...(p.visited ?? {}) },
    completed: { ...(p.completed ?? {}) },
    listening: { ...(p.listening ?? {}) },
    currentModule: MODULE_IDS.includes(p.currentModule ?? "") ? p.currentModule! : base.currentModule,
    currentStep: STEPS.some((s) => s.id === p.currentStep) ? p.currentStep! : base.currentStep,
  };
}

// Copie en mémoire si le stockage du navigateur est indisponible (navigation privée…).
let memory = "";

function rawSnapshot(): string {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function parse(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    return normalize(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

function read(): Progress {
  return parse(rawSnapshot());
}

function write(p: Progress) {
  const json = JSON.stringify(p);
  memory = json;
  try {
    window.localStorage.setItem(KEY, json);
  } catch {
    // stockage indisponible : la progression reste en mémoire pour cette visite
  }
  window.dispatchEvent(new Event("remise-progress"));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("remise-progress", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("remise-progress", cb);
  };
}

/** Progression lue sur l'appareil. `ready` = false pendant le rendu serveur. */
export function useProgress() {
  const raw = useSyncExternalStore(subscribe, rawSnapshot, () => null);
  const progress = useMemo(() => parse(raw), [raw]);
  const update = useCallback((fn: (p: Progress) => Progress) => write(fn(read())), []);
  return { progress, ready: raw !== null, update };
}

// ------------------------------------------------------------ États honnêtes

export type ModuleState = "a-commencer" | "en-cours" | "termine-sans-aide" | "termine-avec-aide" | "a-consolider";

export const STATE_LABELS: Record<ModuleState, string> = {
  "a-commencer": "À commencer",
  "en-cours": "En cours",
  "termine-sans-aide": "Terminé sans aide",
  "termine-avec-aide": "Terminé avec aide",
  "a-consolider": "À consolider",
};

export function moduleState(p: Progress, m: RemiseModule): ModuleState {
  const attempts = m.activities.map((a) => p.attempts[a.id]).filter(Boolean);
  if (attempts.some((a) => a.consolider)) return "a-consolider";
  if (p.completed[m.id]) {
    const helped = attempts.some((a) => a.helped) || (p.missions[m.id]?.helpUsed ?? 0) > 0;
    return helped ? "termine-avec-aide" : "termine-sans-aide";
  }
  return (p.visited[m.id]?.length ?? 0) > 0 ? "en-cours" : "a-commencer";
}

export function stepsDone(p: Progress) {
  return MODULE_IDS.reduce((n, id) => n + (p.visited[id]?.length ?? 0), 0);
}

export const TOTAL_STEPS = MODULE_IDS.length * STEPS.length;
export const TOTAL_CHECKPOINTS = CHECKPOINT_IDS.length;

// ------------------------------------------------------------ Code de reprise

/** Code texte pour reprendre sur un autre appareil. */
export function exportCode(p: Progress) {
  const json = JSON.stringify(p);
  return btoa(unescape(encodeURIComponent(json)));
}

export function importCode(code: string): Progress | null {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const parsed = JSON.parse(json);
    if (parsed?.schemaVersion !== 2) return null;
    return normalize(parsed);
  } catch {
    return null;
  }
}

export function saveProgress(p: Progress) {
  write(p);
}
