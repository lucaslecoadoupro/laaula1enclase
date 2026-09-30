// Types partagés du fil d'actualité (client + serveur).
import type { Fichier } from "@/lib/fichier";

export type ActuType = "info" | "document" | "production";

export const ACTU_TYPES: { id: ActuType; label: string; hint: string }[] = [
  { id: "info", label: "Info", hint: "Annonce, rappel, contrôle, sortie…" },
  { id: "document", label: "Document", hint: "Un fichier à consulter ou télécharger." },
  { id: "production", label: "Production d'élève", hint: "Une belle réalisation à mettre en valeur." },
];

export type Actualite = {
  id: string;
  type: ActuType;
  titre: string;
  contenu: string;
  fichier: Fichier | null;
  lien: string;
  /** Pour les productions : ex. « Léa, 3B » (prénom seulement). */
  auteur: string;
  public: boolean;
  classes: string[];
  epingle: boolean;
  createdAt: string;
  updatedAt: string;
};
