import { cache } from "react";
import { getDb } from "@/lib/db";
import { parseJson } from "@/lib/json";
import type { Fichier } from "@/lib/fichier";
import { DEFAULT_PARCOURS, type Checkpoint, type Parcours, type RemiseModule } from "./content";

export type RemiseSettings = { paperPdf?: Fichier | null };

async function overrides(): Promise<Record<string, { data: unknown; updatedAt: string }>> {
  const db = await getDb();
  const res = await db.execute(`SELECT key, data, updated_at FROM remise_overrides`);
  const out: Record<string, { data: unknown; updatedAt: string }> = {};
  for (const r of res.rows) out[String(r.key)] = { data: parseJson(r.data, null), updatedAt: String(r.updated_at) };
  return out;
}

/** Parcours = kit Conexión + modifications du professeur. Mis en cache pour la durée d'une requête. */
export const getParcours = cache(async (): Promise<Parcours> => {
  const o = await overrides();
  const settings = (o.settings?.data ?? {}) as RemiseSettings;
  return {
    ...DEFAULT_PARCOURS,
    modules: DEFAULT_PARCOURS.modules.map((m) => (o[`module:${m.id}`]?.data as RemiseModule) ?? m),
    checkpoints: DEFAULT_PARCOURS.checkpoints.map((c) => (o[`checkpoint:${c.id}`]?.data as Checkpoint) ?? c),
    paperPdf: settings.paperPdf?.url ?? DEFAULT_PARCOURS.paperPdf,
  };
});

/** Ce qui a été modifié par rapport au kit (clé → date). */
export async function getOverrideDates(): Promise<Record<string, string>> {
  const o = await overrides();
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.updatedAt]));
}

export async function getSettings(): Promise<RemiseSettings> {
  const o = await overrides();
  return (o.settings?.data ?? {}) as RemiseSettings;
}

export async function getOverride<T>(key: string): Promise<T | null> {
  const o = await overrides();
  return (o[key]?.data as T) ?? null;
}

export async function setOverride(key: string, data: unknown) {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO remise_overrides (key, data, updated_at) VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [key, JSON.stringify(data), new Date().toISOString()],
  });
}

export async function deleteOverride(key: string) {
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM remise_overrides WHERE key = ?`, args: [key] });
}
