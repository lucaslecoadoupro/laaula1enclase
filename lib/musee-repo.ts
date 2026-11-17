import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import type { Fichier } from "@/lib/fichier";
import { parseJson } from "@/lib/json";
import type { Creation, CreationInput } from "@/lib/musee";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowTo(row: any): Creation {
  return {
    id: row.id,
    titre: row.titre,
    prenoms: row.prenoms,
    classe: row.classe,
    description: row.description,
    fichier: parseJson<Fichier | null>(row.fichier, null),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCreations(): Promise<Creation[]> {
  const db = await getDb();
  const res = await db.execute(`SELECT * FROM musee ORDER BY created_at DESC`);
  return res.rows.map(rowTo);
}

export async function getCreation(id: string): Promise<Creation | null> {
  const db = await getDb();
  const res = await db.execute({ sql: `SELECT * FROM musee WHERE id = ? LIMIT 1`, args: [id] });
  return res.rows[0] ? rowTo(res.rows[0]) : null;
}

export async function createCreation(c: CreationInput) {
  const db = await getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO musee (id, titre, prenoms, classe, description, fichier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, c.titre, c.prenoms, c.classe, c.description, c.fichier ? JSON.stringify(c.fichier) : null, now, now],
  });
  return id;
}

export async function updateCreation(id: string, c: CreationInput) {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE musee SET titre = ?, prenoms = ?, classe = ?, description = ?, fichier = ?, updated_at = ? WHERE id = ?`,
    args: [c.titre, c.prenoms, c.classe, c.description, c.fichier ? JSON.stringify(c.fichier) : null, new Date().toISOString(), id],
  });
}

export async function deleteCreation(id: string) {
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM musee WHERE id = ?`, args: [id] });
}
