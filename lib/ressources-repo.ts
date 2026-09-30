import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

export type Ressource = {
  id: string;
  titre: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRessource(row: any): Ressource {
  return {
    id: row.id,
    titre: row.titre,
    description: row.description,
    url: row.url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getRessources(): Promise<Ressource[]> {
  const db = await getDb();
  const res = await db.execute(`SELECT * FROM ressources ORDER BY created_at DESC`);
  return res.rows.map(rowToRessource);
}

export async function createRessource(input: { titre: string; description: string; url: string }) {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO ressources (id, titre, description, url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, input.titre, input.description, input.url, now, now],
  });
  return id;
}

export async function updateRessource(
  id: string,
  fields: Partial<{ titre: string; description: string; url: string }>
) {
  const db = await getDb();
  const now = new Date().toISOString();
  const sets: string[] = [];
  const args: string[] = [];

  if (fields.titre !== undefined) { sets.push("titre = ?"); args.push(fields.titre); }
  if (fields.description !== undefined) { sets.push("description = ?"); args.push(fields.description); }
  if (fields.url !== undefined) { sets.push("url = ?"); args.push(fields.url); }

  sets.push("updated_at = ?");
  args.push(now, id);

  await db.execute({ sql: `UPDATE ressources SET ${sets.join(", ")} WHERE id = ?`, args });
}

export async function deleteRessource(id: string) {
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM ressources WHERE id = ?`, args: [id] });
}
