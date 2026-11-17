// Types partagés du Musée (client + serveur).
import type { Fichier } from "@/lib/fichier";

export type Creation = {
  id: string;
  /** Titre de l'œuvre (optionnel). */
  titre: string;
  /** Prénoms des élèves, ex. « Léa et Hugo » (jamais de nom de famille). */
  prenoms: string;
  /** classeSlug (voir lib/classes.ts), ou '' si non précisée. */
  classe: string;
  description: string;
  fichier: Fichier | null;
  createdAt: string;
  updatedAt: string;
};

export type CreationInput = Omit<Creation, "id" | "createdAt" | "updatedAt">;
