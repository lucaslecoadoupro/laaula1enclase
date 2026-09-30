import { getDb } from "@/lib/db";

const KEY = "home";

export type HomeContent = {
  title: string;
  subtitle: string;
  message: string;
};

const DEFAULTS: HomeContent = {
  title: "El aula 1 en casa",
  subtitle: "Retrouve tes séquences, les cours et leurs corrigés, et un parcours pour reprendre les bases. Choisis ta classe ci-dessous.",
  message: "",
};

export async function getHomeContent(): Promise<HomeContent> {
  const db = await getDb();
  const res = await db.execute({ sql: `SELECT * FROM site_content WHERE key = ? LIMIT 1`, args: [KEY] });
  const row = res.rows[0];
  if (!row) return DEFAULTS;
  return {
    title: (row.title as string) || DEFAULTS.title,
    subtitle: (row.subtitle as string) || DEFAULTS.subtitle,
    message: (row.message as string) || "",
  };
}

export async function updateHomeContent(content: HomeContent) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO site_content (key, title, subtitle, message, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET title = excluded.title, subtitle = excluded.subtitle, message = excluded.message, updated_at = excluded.updated_at`,
    args: [KEY, content.title, content.subtitle, content.message, now],
  });
}
