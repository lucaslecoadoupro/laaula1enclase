import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

export type CorrectionBloc = {
  id: string;
  documentId: string;
  position: number;
  titre: string;
  contenu: string;
  /** classeSlug des classes qui voient ce bloc. */
  classes: string[];
  updatedAt: string;
};

function parseClasses(raw: unknown): string[] {
  try {
    const v = JSON.parse(String(raw ?? "[]"));
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBloc(row: any): CorrectionBloc {
  return {
    id: row.id,
    documentId: row.document_id,
    position: Number(row.position ?? 0),
    titre: row.titre,
    contenu: row.contenu,
    classes: parseClasses(row.classes),
    updatedAt: row.updated_at,
  };
}

export async function getCorrection(documentId: string): Promise<CorrectionBloc[]> {
  const db = await getDb();
  const res = await db.execute({
    sql: `SELECT * FROM corrections_blocs WHERE document_id = ? ORDER BY position ASC, created_at ASC`,
    args: [documentId],
  });
  return res.rows.map(rowToBloc);
}

/** Uniquement les blocs dévoilés à cette classe (et non vides). */
export async function getCorrectionVisible(documentId: string, classeSlug: string): Promise<CorrectionBloc[]> {
  const blocs = await getCorrection(documentId);
  return blocs.filter((b) => b.classes.includes(classeSlug) && (b.titre.trim() || b.contenu.trim()));
}

export async function getBloc(id: string): Promise<CorrectionBloc | null> {
  const db = await getDb();
  const res = await db.execute({ sql: `SELECT * FROM corrections_blocs WHERE id = ? LIMIT 1`, args: [id] });
  return res.rows[0] ? rowToBloc(res.rows[0]) : null;
}

export async function createBloc(documentId: string, titre: string): Promise<CorrectionBloc> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = randomUUID();
  const max = await db.execute({
    sql: `SELECT COALESCE(MAX(position), -1) AS m FROM corrections_blocs WHERE document_id = ?`,
    args: [documentId],
  });
  const position = Number(max.rows[0]?.m ?? -1) + 1;
  await db.execute({
    sql: `INSERT INTO corrections_blocs (id, document_id, position, titre, contenu, classes, created_at, updated_at)
          VALUES (?, ?, ?, ?, '', '[]', ?, ?)`,
    args: [id, documentId, position, titre, now, now],
  });
  return { id, documentId, position, titre, contenu: "", classes: [], updatedAt: now };
}

export async function updateBloc(
  id: string,
  fields: Partial<{ titre: string; contenu: string; classes: string[] }>
) {
  const db = await getDb();
  const sets: string[] = [];
  const args: string[] = [];
  if (fields.titre !== undefined) { sets.push("titre = ?"); args.push(fields.titre); }
  if (fields.contenu !== undefined) { sets.push("contenu = ?"); args.push(fields.contenu); }
  if (fields.classes !== undefined) { sets.push("classes = ?"); args.push(JSON.stringify(fields.classes)); }
  sets.push("updated_at = ?");
  args.push(new Date().toISOString(), id);
  await db.execute({ sql: `UPDATE corrections_blocs SET ${sets.join(", ")} WHERE id = ?`, args });
}

/** Réordonne les blocs d'un document selon la liste d'ids fournie. */
export async function reorderBlocs(documentId: string, ids: string[]) {
  const db = await getDb();
  await db.batch(
    ids.map((id, position) => ({
      sql: `UPDATE corrections_blocs SET position = ? WHERE id = ? AND document_id = ?`,
      args: [position, id, documentId],
    })),
    "write"
  );
}

export async function deleteBloc(id: string) {
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM corrections_blocs WHERE id = ?`, args: [id] });
}

export async function deleteCorrection(documentId: string) {
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM corrections_blocs WHERE document_id = ?`, args: [documentId] });
}
