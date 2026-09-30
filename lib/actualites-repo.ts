import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import type { Fichier } from "@/lib/fichier";
import { parseJson, parseStringArray } from "@/lib/json";
import type { Actualite, ActuType } from "@/lib/actualites";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowTo(row: any): Actualite {
  return {
    id: row.id,
    type: (["info", "document", "production"].includes(row.type) ? row.type : "info") as ActuType,
    titre: row.titre,
    contenu: row.contenu,
    fichier: parseJson<Fichier | null>(row.fichier, null),
    lien: row.lien,
    auteur: row.auteur,
    public: Number(row.public) === 1,
    classes: parseStringArray(row.classes),
    epingle: Number(row.epingle) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ORDER = `ORDER BY epingle DESC, created_at DESC`;

export async function getActualites(): Promise<Actualite[]> {
  const db = await getDb();
  const res = await db.execute(`SELECT * FROM actualites ${ORDER}`);
  return res.rows.map(rowTo);
}

/** Publications visibles sur l'accueil public. */
export async function getActualitesPubliques(limit?: number): Promise<Actualite[]> {
  const db = await getDb();
  const res = await db.execute({
    sql: `SELECT * FROM actualites WHERE public = 1 ${ORDER}${limit ? " LIMIT ?" : ""}`,
    args: limit ? [limit] : [],
  });
  return res.rows.map(rowTo);
}

/** Publications visibles par une classe : publiques + celles qui lui sont destinées. */
export async function getActualitesForClasse(classeSlug: string, limit = 20): Promise<Actualite[]> {
  return (await getActualites()).filter((a) => a.public || a.classes.includes(classeSlug)).slice(0, limit);
}

export async function getActualite(id: string): Promise<Actualite | null> {
  const db = await getDb();
  const res = await db.execute({ sql: `SELECT * FROM actualites WHERE id = ? LIMIT 1`, args: [id] });
  return res.rows[0] ? rowTo(res.rows[0]) : null;
}

export type ActuInput = Omit<Actualite, "id" | "createdAt" | "updatedAt">;

export async function createActualite(a: ActuInput) {
  const db = await getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO actualites (id, type, titre, contenu, fichier, lien, auteur, public, classes, epingle, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, a.type, a.titre, a.contenu, a.fichier ? JSON.stringify(a.fichier) : null, a.lien, a.auteur, a.public ? 1 : 0, JSON.stringify(a.classes), a.epingle ? 1 : 0, now, now],
  });
  return id;
}

export async function updateActualite(id: string, a: ActuInput) {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE actualites SET type = ?, titre = ?, contenu = ?, fichier = ?, lien = ?, auteur = ?, public = ?, classes = ?, epingle = ?, updated_at = ? WHERE id = ?`,
    args: [a.type, a.titre, a.contenu, a.fichier ? JSON.stringify(a.fichier) : null, a.lien, a.auteur, a.public ? 1 : 0, JSON.stringify(a.classes), a.epingle ? 1 : 0, new Date().toISOString(), id],
  });
}

export async function deleteActualite(id: string) {
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM actualites WHERE id = ?`, args: [id] });
}
