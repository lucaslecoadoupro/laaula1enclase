// Format d'une question à choix unique — le même que les activités du parcours
// Conexión español, pour que le lecteur soit partagé. Importable côté client.

export type QcmQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
};

export function emptyQuestion(): QcmQuestion {
  return { prompt: "", options: ["", "", ""], correctIndex: 0, hint: "", explanation: "" };
}

/** Nettoie une liste de questions reçue du navigateur. `null` si le format est invalide. */
export function sanitizeQuestions(value: unknown): QcmQuestion[] | null {
  if (!Array.isArray(value) || value.length > 60) return null;
  const out: QcmQuestion[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") return null;
    const q = raw as Record<string, unknown>;
    const options = Array.isArray(q.options) ? q.options.filter((o): o is string => typeof o === "string").slice(0, 6) : [];
    if (options.length < 2) return null;
    const correctIndex = typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < options.length ? q.correctIndex : 0;
    out.push({
      prompt: typeof q.prompt === "string" ? q.prompt : "",
      options,
      correctIndex,
      hint: typeof q.hint === "string" ? q.hint : "",
      explanation: typeof q.explanation === "string" ? q.explanation : "",
    });
  }
  return out;
}

/** Questions prêtes à être jouées : énoncé et au moins deux options remplis. */
export function playableQuestions(questions: QcmQuestion[]) {
  return questions.filter((q) => q.prompt.trim() && q.options.filter((o) => o.trim()).length >= 2);
}
