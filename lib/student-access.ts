import { notFound } from "next/navigation";
import { findClasse } from "@/lib/classes";
import { isAdminRequest } from "@/lib/admin-session";
import { getCours, getCoursOfSequence, getElement, getSequence, type Cours } from "@/lib/pedago-repo";

/**
 * Chargement + contrôle d'accès côté élève. Le proxy a déjà vérifié le mot de
 * passe de la classe ; ici on vérifie que le contenu demandé appartient bien à
 * une séquence de cette classe et qu'il est publié (le professeur voit aussi
 * les brouillons, pour l'aperçu).
 */
export async function loadClasse(matiereSlug: string, classeSlug: string) {
  const classe = findClasse(matiereSlug, classeSlug);
  if (!classe) notFound();
  const admin = await isAdminRequest();
  return { classe, admin };
}

export function visibleCours(list: Cours[], admin: boolean) {
  return admin ? list : list.filter((c) => c.status === "published");
}

export async function loadSequence(classeSlug: string, sequenceId: string, admin: boolean) {
  const sequence = await getSequence(sequenceId);
  if (!sequence || !sequence.classes.includes(classeSlug)) notFound();
  const cours = visibleCours(await getCoursOfSequence(sequence.id), admin);
  return { sequence, cours };
}

export async function loadCours(classeSlug: string, coursId: string, admin: boolean) {
  const cours = await getCours(coursId);
  if (!cours || (!admin && cours.status !== "published")) notFound();
  const { sequence, cours: siblings } = await loadSequence(classeSlug, cours.sequenceId, admin);
  return { cours, sequence, siblings };
}

export async function loadElement(classeSlug: string, coursId: string, elementId: string, admin: boolean) {
  const ctx = await loadCours(classeSlug, coursId, admin);
  const element = await getElement(elementId);
  if (!element || element.coursId !== ctx.cours.id) notFound();
  return { ...ctx, element };
}
