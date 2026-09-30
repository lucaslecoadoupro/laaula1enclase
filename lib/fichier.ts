/** Fichier stocké sur Vercel Blob, tel qu'enregistré en base (JSON). */
export type Fichier = {
  url: string;
  pathname: string;
  contentType: string;
  taille: number;
  nom: string;
};

export function isBlobUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Valide un fichier reçu du navigateur. `null` explicite = retirer le fichier ; `undefined` = invalide. */
export function sanitizeFichier(value: unknown): Fichier | null | undefined {
  if (value === null) return null;
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  if (typeof v.url !== "string" || !isBlobUrl(v.url) || typeof v.pathname !== "string") return undefined;
  return {
    url: v.url,
    pathname: v.pathname,
    contentType: typeof v.contentType === "string" ? v.contentType : "",
    taille: typeof v.taille === "number" ? v.taille : 0,
    nom: typeof v.nom === "string" ? v.nom.slice(0, 200) : v.pathname.split("/").pop() ?? "fichier",
  };
}
