import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      throw new Error(
        "TURSO_DATABASE_URL manquant. En local, utilise `file:local.db` (voir .env.example). En prod, mets l'URL Turso."
      );
    }
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN, // inutile en local avec file:
    });
  }
  return client;
}

async function ensureSchema(db: Client) {
  // NB : les anciennes tables `seances`, `import_log` et `documents_partages`
  // (versions précédentes du site) ne sont plus utilisées. Elles ne sont pas
  // supprimées pour ne rien perdre, mais plus aucun code ne les lit.

  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS ressources (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Séquence : partagée par plusieurs classes (`classes` = tableau JSON de classeSlug).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sequences (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      classes TEXT NOT NULL DEFAULT '[]',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Cours d'une séquence : un document principal (fichier Vercel Blob, JSON) + son corrigé.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS cours (
      id TEXT PRIMARY KEY,
      sequence_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      titre TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      fichier TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cours_sequence ON cours (sequence_id, position)`);

  // Exercices d'entraînement et approfondissements d'un cours :
  // type 'fichier' (document + corrigé) ou 'qcm' (questions corrigées automatiquement).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS elements (
      id TEXT PRIMARY KEY,
      cours_id TEXT NOT NULL,
      section TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      titre TEXT NOT NULL,
      consigne TEXT NOT NULL DEFAULT '',
      fichier TEXT,
      questions TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_elements_cours ON elements (cours_id, section, position)`);

  // Remise à niveau : modifications du professeur par rapport au kit Conexión
  // (clé "module:S01", "checkpoint:B01" ou "settings" ; data = JSON complet).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS remise_overrides (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Fil d'actualité : infos, documents, productions d'élèves.
  // public = 1 → visible sur l'accueil (sans mot de passe) ; sinon seulement
  // dans l'espace des classes listées dans `classes` (JSON).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS actualites (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'info',
      titre TEXT NOT NULL,
      contenu TEXT NOT NULL DEFAULT '',
      fichier TEXT,
      lien TEXT NOT NULL DEFAULT '',
      auteur TEXT NOT NULL DEFAULT '',
      public INTEGER NOT NULL DEFAULT 1,
      classes TEXT NOT NULL DEFAULT '[]',
      epingle INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Corrigé découpé en blocs, dévoilés classe par classe.
  // `document_id` = id du cours (document principal) ou d'un élément de type fichier.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS corrections_blocs (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      titre TEXT NOT NULL DEFAULT '',
      contenu TEXT NOT NULL DEFAULT '',
      classes TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_corrections_document ON corrections_blocs (document_id, position)`);
}

/** Retourne un client DB prêt à l'emploi (schéma garanti présent). */
export async function getDb(): Promise<Client> {
  const db = getClient();
  if (!schemaReady) {
    schemaReady = ensureSchema(db);
  }
  await schemaReady;
  return db;
}
