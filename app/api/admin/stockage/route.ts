import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";

export const dynamic = "force-dynamic";

type Check = { ok: boolean; label: string; detail?: string };

/** Traduit une erreur Vercel Blob en explication + marche à suivre. */
function explain(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("private")) {
    return "Ton store est en accès « Private ». Le site a besoin d'un store « Public » (les documents sont affichés directement aux élèves). Crée un nouveau store Blob en Public, connecte-le au projet, déconnecte l'ancien, puis redéploie.";
  }
  if (m.includes("no blob credentials") || m.includes("no read-write token")) {
    return "Aucun identifiant de stockage n'est visible par le site. Vérifie dans Vercel → ton projet → Storage que le store est bien connecté à ce projet, pour l'environnement Production, puis fais « Redeploy » (les variables ne sont prises en compte qu'au déploiement suivant).";
  }
  if (m.includes("access denied") || m.includes("forbidden") || m.includes("invalid")) {
    return "Le jeton de stockage est refusé (store supprimé ou reconnecté ?). Dans Vercel → Storage → ton store → Projects, fais « Update Project Connection », puis redéploie.";
  }
  if (m.includes("does not exist") || m.includes("store_not_found")) {
    return "Le store indiqué n'existe plus. Reconnecte un store Blob au projet, puis redéploie.";
  }
  if (m.includes("suspended")) return "Le store est suspendu (quota dépassé ?). Regarde l'onglet Usage de Vercel.";
  if (m.includes("oidc")) {
    return "L'authentification automatique (OIDC) n'est pas autorisée pour cet environnement. Vérifie les environnements cochés dans la connexion du store.";
  }
  return "Erreur inattendue du stockage. Copie ce message si tu as besoin d'aide.";
}

/**
 * Diagnostic du stockage de fichiers (Vercel Blob) : variables présentes,
 * puis envoi et suppression réels d'un petit fichier de test.
 */
export async function GET() {
  const rw = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = process.env.BLOB_STORE_ID;
  const checks: Check[] = [];

  checks.push({
    ok: !!rw,
    label: "Jeton BLOB_READ_WRITE_TOKEN",
    detail: rw
      ? "Présent : les envois depuis le navigateur sont possibles."
      : "Absent. Il est indispensable pour envoyer des fichiers depuis ton navigateur. Vercel l'ajoute normalement tout seul quand on connecte un store au projet (Storage → ton store → Projects → ⋯ → Update Project Connection) ; s'il manque, copie-le depuis la page du store (onglet « .env.local ») dans Settings → Environment Variables, puis redéploie.",
  });
  checks.push({
    ok: !!storeId || !!rw,
    label: "Store connecté (BLOB_STORE_ID)",
    detail: storeId ? `Présent (${storeId}).` : rw ? "Absent, mais le jeton suffit." : "Absent : aucun store Blob n'est connecté à ce projet.",
  });

  let testUrl: string | null = null;
  try {
    const blob = await put("diagnostic/test.txt", "ok", { access: "public", addRandomSuffix: true, contentType: "text/plain" });
    testUrl = blob.url;
    checks.push({ ok: true, label: "Envoi d'un fichier de test (accès public)", detail: "Réussi." });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    checks.push({ ok: false, label: "Envoi d'un fichier de test (accès public)", detail: `${explain(msg)}\n\nMessage technique : ${msg}` });
  }
  if (testUrl) {
    try {
      await del(testUrl);
      checks.push({ ok: true, label: "Suppression du fichier de test", detail: "Réussie." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      checks.push({ ok: false, label: "Suppression du fichier de test", detail: `${explain(msg)}\n\nMessage technique : ${msg}` });
    }
  }

  return NextResponse.json({ ok: checks.every((c) => c.ok), checks, environment: process.env.VERCEL_ENV ?? "local" });
}
