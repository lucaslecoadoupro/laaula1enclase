import { findClasseBySlug } from "@/lib/classes";
import { sanitizeFichier } from "@/lib/fichier";
import type { CreationInput } from "@/lib/musee";

/** Valide une création envoyée par l'admin. Retourne un message d'erreur ou les données propres. */
export function validateCreation(body: unknown): { error: string } | { data: CreationInput } {
  if (!body || typeof body !== "object") return { error: "Corps de requête invalide." };
  const b = body as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const fichier = sanitizeFichier(b.fichier ?? null);
  if (fichier === undefined) return { error: "Fichier invalide." };
  if (!fichier) return { error: "Ajoute la création (image, PDF, audio, vidéo…)." };

  const prenoms = str(b.prenoms, 120);
  if (!prenoms) return { error: "Indique le ou les prénoms." };

  const classe = str(b.classe, 20);
  if (classe && !findClasseBySlug(classe)) return { error: "Classe inconnue." };

  return {
    data: {
      titre: str(b.titre, 200),
      prenoms,
      classe,
      description: str(b.description, 4000),
      fichier,
    },
  };
}
