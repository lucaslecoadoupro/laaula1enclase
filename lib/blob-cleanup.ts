import { del } from "@vercel/blob";
import type { Fichier } from "@/lib/fichier";
import { ensureBlobEnv } from "@/lib/blob-env";

/** Supprime des fichiers de Vercel Blob, sans jamais faire échouer l'appelant. */
export async function deleteFichiers(fichiers: (Fichier | null | undefined)[]) {
  const urls = fichiers.filter((f): f is Fichier => !!f).map((f) => f.url);
  if (urls.length === 0) return;
  ensureBlobEnv();
  try {
    await del(urls);
  } catch (error) {
    console.error("Suppression Blob échouée :", error);
  }
}
