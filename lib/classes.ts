export type ClasseConfig = {
  matiereSlug: string;
  matiereLabel: string;
  classeSlug: string;
  classeLabel: string;
  /** Nom de la variable d'environnement Vercel qui contient le mot de passe (en clair) de cette classe. */
  passwordEnvVar: string;
};

/**
 * Ajoute ou modifie une entrée par matière/classe ici. `classeSlug` en
 * minuscules (ex. "3e") : il sert dans les URL et dans les séquences.
 * Le `passwordEnvVar` doit correspondre à une variable d'environnement
 * définie sur Vercel (voir README.md -> "Définir un mot de passe").
 */
export const classes: ClasseConfig[] = [
  { matiereSlug: "espagnol", matiereLabel: "Espagnol", classeSlug: "3a", classeLabel: "3A", passwordEnvVar: "CLASS_ESPAGNOL_3A_PASSWORD" },
  { matiereSlug: "espagnol", matiereLabel: "Espagnol", classeSlug: "3b", classeLabel: "3B", passwordEnvVar: "CLASS_ESPAGNOL_3B_PASSWORD" },
  { matiereSlug: "espagnol", matiereLabel: "Espagnol", classeSlug: "3c", classeLabel: "3C", passwordEnvVar: "CLASS_ESPAGNOL_3C_PASSWORD" },
  { matiereSlug: "espagnol", matiereLabel: "Espagnol", classeSlug: "3d", classeLabel: "3D", passwordEnvVar: "CLASS_ESPAGNOL_3D_PASSWORD" },
  { matiereSlug: "espagnol", matiereLabel: "Espagnol", classeSlug: "3e", classeLabel: "3E", passwordEnvVar: "CLASS_ESPAGNOL_3E_PASSWORD" },
  { matiereSlug: "espagnol", matiereLabel: "Espagnol", classeSlug: "3f", classeLabel: "3F", passwordEnvVar: "CLASS_ESPAGNOL_3F_PASSWORD" },
  { matiereSlug: "espagnol", matiereLabel: "Espagnol", classeSlug: "4a", classeLabel: "4A", passwordEnvVar: "CLASS_ESPAGNOL_4A_PASSWORD" },
];

export function getMatieres() {
  const seen = new Map<string, string>();
  for (const c of classes) seen.set(c.matiereSlug, c.matiereLabel);
  return Array.from(seen, ([matiereSlug, matiereLabel]) => ({ matiereSlug, matiereLabel }));
}

export function getClassesForMatiere(matiereSlug: string) {
  return classes.filter((c) => c.matiereSlug === matiereSlug);
}

export function findClasse(matiereSlug: string, classeSlug: string) {
  return classes.find((c) => c.matiereSlug === matiereSlug && c.classeSlug === classeSlug);
}

export function findClasseBySlug(classeSlug: string) {
  return classes.find((c) => c.classeSlug === classeSlug);
}
