import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import type { Fichier } from "@/lib/fichier";
import { parseJson, parseStringArray } from "@/lib/json";
import type { QcmQuestion } from "@/lib/qcm";

// ---------------------------------------------------------------- Types

export type Sequence = {
  id: string;
  titre: string;
  description: string;
  classes: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type CoursStatus = "draft" | "published";

export type Cours = {
  id: string;
  sequenceId: string;
  position: number;
  titre: string;
  description: string;
  status: CoursStatus;
  fichier: Fichier | null;
  updatedAt: string;
};

export type Section = "entrainement" | "approfondissement";
export type ElementType = "fichier" | "qcm";

export type Element = {
  id: string;
  coursId: string;
  section: Section;
  position: number;
  type: ElementType;
  titre: string;
  consigne: string;
  fichier: Fichier | null;
  questions: QcmQuestion[];
  updatedAt: string;
};

export const SECTIONS: { id: Section; label: string; hint: string }[] = [
  { id: "entrainement", label: "Entraînement", hint: "Pour s'exercer sur les notions du cours." },
  { id: "approfondissement", label: "Approfondissement", hint: "Pour aller plus loin." },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

function rowToSequence(row: Row): Sequence {
  return {
    id: row.id,
    titre: row.titre,
    description: row.description,
    classes: parseStringArray(row.classes),
    position: Number(row.position ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCours(row: Row): Cours {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    position: Number(row.position ?? 0),
    titre: row.titre,
    description: row.description,
    status: row.status === "published" ? "published" : "draft",
    fichier: parseJson<Fichier | null>(row.fichier, null),
    updatedAt: row.updated_at,
  };
}

function rowToElement(row: Row): Element {
  return {
    id: row.id,
    coursId: row.cours_id,
    section: row.section === "approfondissement" ? "approfondissement" : "entrainement",
    position: Number(row.position ?? 0),
    type: row.type === "qcm" ? "qcm" : "fichier",
    titre: row.titre,
    consigne: row.consigne,
    fichier: parseJson<Fichier | null>(row.fichier, null),
    questions: parseJson<QcmQuestion[]>(row.questions, []),
    updatedAt: row.updated_at,
  };
}

const now = () => new Date().toISOString();

async function nextPosition(table: string, where: string, args: string[]) {
  const db = await getDb();
  const res = await db.execute({ sql: `SELECT COALESCE(MAX(position), -1) AS m FROM ${table} WHERE ${where}`, args });
  return Number(res.rows[0]?.m ?? -1) + 1;
}

async function reorder(table: string, scopeColumn: string, scopeId: string, ids: string[]) {
  const db = await getDb();
  if (ids.length === 0) return;
  await db.batch(
    ids.map((id, position) => ({
      sql: `UPDATE ${table} SET position = ? WHERE id = ? AND ${scopeColumn} = ?`,
      args: [position, id, scopeId],
    })),
    "write"
  );
}

// ---------------------------------------------------------------- Séquences

export async function getSequences(): Promise<Sequence[]> {
  const db = await getDb();
  const res = await db.execute(`SELECT * FROM sequences ORDER BY position ASC, created_at ASC`);
  return res.rows.map(rowToSequence);
}

export async function getSequencesForClasse(classeSlug: string) {
  return (await getSequences()).filter((s) => s.classes.includes(classeSlug));
}

export async function getSequence(id: string): Promise<Sequence | null> {
  const db = await getDb();
  const res = await db.execute({ sql: `SELECT * FROM sequences WHERE id = ? LIMIT 1`, args: [id] });
  return res.rows[0] ? rowToSequence(res.rows[0]) : null;
}

export async function createSequence(input: { titre: string; description: string; classes: string[] }) {
  const db = await getDb();
  const id = randomUUID();
  const t = now();
  const position = await nextPosition("sequences", "1 = 1", []);
  await db.execute({
    sql: `INSERT INTO sequences (id, titre, description, classes, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, input.titre, input.description, JSON.stringify(input.classes), position, t, t],
  });
  return id;
}

export async function updateSequence(id: string, fields: Partial<{ titre: string; description: string; classes: string[] }>) {
  const db = await getDb();
  const sets: string[] = [];
  const args: string[] = [];
  if (fields.titre !== undefined) { sets.push("titre = ?"); args.push(fields.titre); }
  if (fields.description !== undefined) { sets.push("description = ?"); args.push(fields.description); }
  if (fields.classes !== undefined) { sets.push("classes = ?"); args.push(JSON.stringify(fields.classes)); }
  sets.push("updated_at = ?");
  args.push(now(), id);
  await db.execute({ sql: `UPDATE sequences SET ${sets.join(", ")} WHERE id = ?`, args });
}

export async function reorderSequences(ids: string[]) {
  const db = await getDb();
  await db.batch(ids.map((id, position) => ({ sql: `UPDATE sequences SET position = ? WHERE id = ?`, args: [position, id] })), "write");
}

/** Supprime la séquence, ses cours, leurs éléments et corrigés. Retourne les fichiers à effacer du stockage. */
export async function deleteSequence(id: string): Promise<Fichier[]> {
  const cours = await getCoursOfSequence(id);
  const fichiers: Fichier[] = [];
  for (const c of cours) fichiers.push(...(await deleteCours(c.id)));
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM sequences WHERE id = ?`, args: [id] });
  return fichiers;
}

// ---------------------------------------------------------------- Cours

export async function getCoursOfSequence(sequenceId: string): Promise<Cours[]> {
  const db = await getDb();
  const res = await db.execute({
    sql: `SELECT * FROM cours WHERE sequence_id = ? ORDER BY position ASC, created_at ASC`,
    args: [sequenceId],
  });
  return res.rows.map(rowToCours);
}

/** Nombre de cours (publiés / total) par séquence. */
export async function getCoursCounts(): Promise<Record<string, { published: number; total: number }>> {
  const db = await getDb();
  const res = await db.execute(
    `SELECT sequence_id, COUNT(*) AS total, SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published FROM cours GROUP BY sequence_id`
  );
  const out: Record<string, { published: number; total: number }> = {};
  for (const r of res.rows) out[String(r.sequence_id)] = { total: Number(r.total), published: Number(r.published ?? 0) };
  return out;
}

export async function getCours(id: string): Promise<Cours | null> {
  const db = await getDb();
  const res = await db.execute({ sql: `SELECT * FROM cours WHERE id = ? LIMIT 1`, args: [id] });
  return res.rows[0] ? rowToCours(res.rows[0]) : null;
}

export async function createCours(sequenceId: string, titre: string) {
  const db = await getDb();
  const id = randomUUID();
  const t = now();
  const position = await nextPosition("cours", "sequence_id = ?", [sequenceId]);
  await db.execute({
    sql: `INSERT INTO cours (id, sequence_id, position, titre, description, status, fichier, created_at, updated_at)
          VALUES (?, ?, ?, ?, '', 'draft', NULL, ?, ?)`,
    args: [id, sequenceId, position, titre, t, t],
  });
  return id;
}

export async function updateCours(
  id: string,
  fields: Partial<{ titre: string; description: string; status: CoursStatus; fichier: Fichier | null }>
) {
  const db = await getDb();
  const sets: string[] = [];
  const args: (string | null)[] = [];
  if (fields.titre !== undefined) { sets.push("titre = ?"); args.push(fields.titre); }
  if (fields.description !== undefined) { sets.push("description = ?"); args.push(fields.description); }
  if (fields.status !== undefined) { sets.push("status = ?"); args.push(fields.status); }
  if (fields.fichier !== undefined) { sets.push("fichier = ?"); args.push(fields.fichier ? JSON.stringify(fields.fichier) : null); }
  sets.push("updated_at = ?");
  args.push(now(), id);
  await db.execute({ sql: `UPDATE cours SET ${sets.join(", ")} WHERE id = ?`, args });
}

export async function reorderCours(sequenceId: string, ids: string[]) {
  await reorder("cours", "sequence_id", sequenceId, ids);
}

export async function deleteCours(id: string): Promise<Fichier[]> {
  const db = await getDb();
  const cours = await getCours(id);
  const elements = await getElementsOfCours(id);
  const fichiers = [cours?.fichier, ...elements.map((e) => e.fichier)].filter((f): f is Fichier => !!f);
  const targets = [id, ...elements.map((e) => e.id)];
  await db.batch(
    [
      ...targets.map((t) => ({ sql: `DELETE FROM corrections_blocs WHERE document_id = ?`, args: [t] })),
      { sql: `DELETE FROM elements WHERE cours_id = ?`, args: [id] },
      { sql: `DELETE FROM cours WHERE id = ?`, args: [id] },
    ],
    "write"
  );
  return fichiers;
}

// ---------------------------------------------------------------- Éléments

export async function getElementsOfCours(coursId: string): Promise<Element[]> {
  const db = await getDb();
  const res = await db.execute({
    sql: `SELECT * FROM elements WHERE cours_id = ? ORDER BY position ASC, created_at ASC`,
    args: [coursId],
  });
  return res.rows.map(rowToElement);
}

export async function getElement(id: string): Promise<Element | null> {
  const db = await getDb();
  const res = await db.execute({ sql: `SELECT * FROM elements WHERE id = ? LIMIT 1`, args: [id] });
  return res.rows[0] ? rowToElement(res.rows[0]) : null;
}

export async function createElement(coursId: string, input: { section: Section; type: ElementType; titre: string }) {
  const db = await getDb();
  const id = randomUUID();
  const t = now();
  const position = await nextPosition("elements", "cours_id = ? AND section = ?", [coursId, input.section]);
  await db.execute({
    sql: `INSERT INTO elements (id, cours_id, section, position, type, titre, consigne, fichier, questions, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, '', NULL, '[]', ?, ?)`,
    args: [id, coursId, input.section, position, input.type, input.titre, t, t],
  });
  return id;
}

export async function updateElement(
  id: string,
  fields: Partial<{ titre: string; consigne: string; fichier: Fichier | null; questions: QcmQuestion[] }>
) {
  const db = await getDb();
  const sets: string[] = [];
  const args: (string | null)[] = [];
  if (fields.titre !== undefined) { sets.push("titre = ?"); args.push(fields.titre); }
  if (fields.consigne !== undefined) { sets.push("consigne = ?"); args.push(fields.consigne); }
  if (fields.fichier !== undefined) { sets.push("fichier = ?"); args.push(fields.fichier ? JSON.stringify(fields.fichier) : null); }
  if (fields.questions !== undefined) { sets.push("questions = ?"); args.push(JSON.stringify(fields.questions)); }
  sets.push("updated_at = ?");
  args.push(now(), id);
  await db.execute({ sql: `UPDATE elements SET ${sets.join(", ")} WHERE id = ?`, args });
}

export async function reorderElements(coursId: string, ids: string[]) {
  await reorder("elements", "cours_id", coursId, ids);
}

export async function deleteElement(id: string): Promise<Fichier[]> {
  const db = await getDb();
  const el = await getElement(id);
  await db.batch(
    [
      { sql: `DELETE FROM corrections_blocs WHERE document_id = ?`, args: [id] },
      { sql: `DELETE FROM elements WHERE id = ?`, args: [id] },
    ],
    "write"
  );
  return el?.fichier ? [el.fichier] : [];
}

// ---------------------------------------------------------------- Cibles de corrigé

/**
 * Retrouve à quoi se rattache un corrigé (cours ou élément fichier) et les
 * classes qui y ont accès (celles de la séquence).
 */
export async function getCorrectionTarget(targetId: string): Promise<{ classes: string[] } | null> {
  const cours = await getCours(targetId);
  if (cours) {
    const seq = await getSequence(cours.sequenceId);
    return seq ? { classes: seq.classes } : null;
  }
  const el = await getElement(targetId);
  if (el && el.type === "fichier") {
    const c = await getCours(el.coursId);
    const seq = c ? await getSequence(c.sequenceId) : null;
    return seq ? { classes: seq.classes } : null;
  }
  return null;
}

/** Nombre d'éléments (exercices) par cours. */
export async function getElementCounts(): Promise<Record<string, number>> {
  const db = await getDb();
  const res = await db.execute(`SELECT cours_id, COUNT(*) AS n FROM elements GROUP BY cours_id`);
  const out: Record<string, number> = {};
  for (const r of res.rows) out[String(r.cours_id)] = Number(r.n);
  return out;
}
