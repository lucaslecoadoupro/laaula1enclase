// Usage: node scripts/check-env.mjs
// Affiche ce que Next.js voit réellement dans tes fichiers .env*, sans
// jamais afficher les valeurs en clair (juste leur présence et longueur).
import pkg from "@next/env";
const { loadEnvConfig } = pkg;

console.log("Dossier courant :", process.cwd());
console.log("(doit être le dossier du projet, celui qui contient package.json)\n");

loadEnvConfig(process.cwd());

const keys = [
  "SESSION_SECRET",
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "ADMIN_PASSWORD",
  "BLOB_READ_WRITE_TOKEN",
  "CLASS_ESPAGNOL_3A_PASSWORD",
  "CLASS_ESPAGNOL_3B_PASSWORD",
  "CLASS_ESPAGNOL_3C_PASSWORD",
  "CLASS_ESPAGNOL_3D_PASSWORD",
  "CLASS_ESPAGNOL_3E_PASSWORD",
  "CLASS_ESPAGNOL_3F_PASSWORD",
  "CLASS_ESPAGNOL_4A_PASSWORD",
];

for (const key of keys) {
  const value = process.env[key];
  if (key === "TURSO_DATABASE_URL" && value) {
    console.log(`${key}: ${value}`); // pas un secret, utile de le voir en clair
  } else {
    console.log(`${key}: ${value ? `défini (${value.length} caractères)` : "MANQUANT"}`);
  }
}
