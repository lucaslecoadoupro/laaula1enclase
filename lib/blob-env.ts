// Vercel ajoute les variables du store Blob avec un préfixe choisi à la
// connexion (par défaut « BLOB », donc BLOB_STORE_ID, BLOB_READ_WRITE_TOKEN…).
// Si un autre préfixe a été saisi (ex. BLOB_READ_WRITE_TOKEN_STORE_ID), le SDK
// ne trouve rien : on recopie ces valeurs sous les noms standards qu'il attend.

type Found = { name: string | null };
export type BlobEnvReport = {
  storeId: Found;
  readWriteToken: Found;
  webhookPublicKey: Found;
  /** Méthode d'envoi depuis le navigateur. */
  uploadMode: "token" | "presigned" | "none";
};

let report: BlobEnvReport | null = null;

function findVar(standard: string, suffix: string, valuePrefix?: string): string | null {
  if (process.env[standard]) return standard;
  const names = Object.keys(process.env).filter((n) => n.endsWith(suffix) && n !== standard);
  // Priorité aux variables Blob (préfixe contenant BLOB), puis valeur reconnaissable.
  const byValue = valuePrefix ? names.filter((n) => process.env[n]?.startsWith(valuePrefix)) : names;
  const pick = byValue.find((n) => n.includes("BLOB")) ?? byValue[0] ?? names.find((n) => n.includes("BLOB")) ?? null;
  return pick;
}

/** Recopie les variables préfixées sous les noms standards (une seule fois par processus). */
export function ensureBlobEnv(): BlobEnvReport {
  // Détection faite une seule fois : on garde les noms d'origine pour le diagnostic.
  if (report) return report;
  const storeName = findVar("BLOB_STORE_ID", "_STORE_ID", "store_");
  // Le jeton peut s'appeler BLOB_READ_WRITE_TOKEN, <PRÉFIXE>_READ_WRITE_TOKEN…
  const rwName =
    findVar("BLOB_READ_WRITE_TOKEN", "_READ_WRITE_TOKEN", "vercel_blob_rw_") ??
    Object.keys(process.env).find((n) => process.env[n]?.startsWith("vercel_blob_rw_")) ??
    null;
  const webhookName = findVar("BLOB_WEBHOOK_PUBLIC_KEY", "_WEBHOOK_PUBLIC_KEY");

  if (storeName && storeName !== "BLOB_STORE_ID") process.env.BLOB_STORE_ID = process.env[storeName];
  if (rwName && rwName !== "BLOB_READ_WRITE_TOKEN") process.env.BLOB_READ_WRITE_TOKEN = process.env[rwName];
  if (webhookName && webhookName !== "BLOB_WEBHOOK_PUBLIC_KEY") process.env.BLOB_WEBHOOK_PUBLIC_KEY = process.env[webhookName];

  report = {
    storeId: { name: storeName },
    readWriteToken: { name: rwName },
    webhookPublicKey: { name: webhookName },
    uploadMode: rwName ? "token" : storeName ? "presigned" : "none",
  };
  return report;
}
