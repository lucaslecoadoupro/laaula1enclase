import { sanitizeClasses } from "@/lib/classes-validation";
import { sanitizeFichier } from "@/lib/fichier";
import type { ActuInput } from "@/lib/actualites-repo";

/** Valide une publication envoyée par l'admin. Retourne un message d'erreur ou les données propres. */
export function validateActu(body: unknown): { error: string } | { data: ActuInput } {
  if (!body || typeof body !== "object") return { error: "Corps de requête invalide." };
  const b = body as Record<string, unknown>;
  const titre = typeof b.titre === "string" ? b.titre.trim().slice(0, 200) : "";
  if (!titre) return { error: "Le titre est requis." };
  const type = b.type === "document" || b.type === "production" ? b.type : "info";
  const fichier = b.fichier === undefined ? null : sanitizeFichier(b.fichier);
  if (fichier === undefined) return { error: "Fichier invalide." };
  let lien = typeof b.lien === "string" ? b.lien.trim().slice(0, 1000) : "";
  if (lien && !/^https?:\/\//i.test(lien) && !lien.startsWith("/")) lien = `https://${lien}`;
  const isPublic = b.public === true;
  const classes = sanitizeClasses(b.classes) ?? [];
  if (!isPublic && classes.length === 0) return { error: "Choisis « Tout le monde » ou au moins une classe." };
  return {
    data: {
      type,
      titre,
      contenu: typeof b.contenu === "string" ? b.contenu.slice(0, 8000) : "",
      fichier,
      lien,
      auteur: typeof b.auteur === "string" ? b.auteur.trim().slice(0, 80) : "",
      public: isPublic,
      classes: isPublic ? [] : classes,
      epingle: b.epingle === true,
    },
  };
}
