import { NextResponse } from "next/server";
import { del, issueSignedToken, put } from "@vercel/blob";
import { ensureBlobEnv } from "@/lib/blob-env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Check = { ok: boolean; label: string; detail?: string };

/** Limite de durée d'une étape (la bibliothèque réessaie plusieurs fois en cas d'erreur réseau). */
function withTimeout<T>(p: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Pas de réponse du service de stockage après ${ms / 1000} s (réseau ?).`)), ms)),
  ]);
}

/** Traduit une erreur Vercel Blob en explication + marche à suivre. */
function explain(message: string, hasStore = false): string {
  const m = message.toLowerCase();
  if (hasStore && m.includes("no blob credentials")) {
    return "Le store est bien trouvé, mais le jeton d'authentification automatique (OIDC) est absent. Sur Vercel il est fourni tout seul à chaque déploiement : redéploie le projet. En local, lance « vercel env pull » pour le récupérer.";
  }
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
  const env = ensureBlobEnv();
  const checks: Check[] = [];
  const std = (found: string | null, standard: string) =>
    found === standard ? `Présent (${standard}).` : `Présent sous le nom ${found} (préfixe personnalisé) : pris en compte automatiquement.`;

  checks.push({
    ok: !!env.storeId.name || !!env.readWriteToken.name,
    label: "Store Blob connecté au projet",
    detail: env.storeId.name
      ? std(env.storeId.name, "BLOB_STORE_ID")
      : env.readWriteToken.name
        ? "Identifiant du store absent, mais le jeton suffit."
        : "Aucune variable de store trouvée. Dans Vercel → ton projet → Storage, connecte le store Blob à ce projet (environnement Production coché), puis redéploie.",
  });
  checks.push({
    ok: env.uploadMode !== "none",
    label: "Méthode d'envoi depuis le navigateur",
    detail:
      env.uploadMode === "token"
        ? `Jeton longue durée : ${std(env.readWriteToken.name, "BLOB_READ_WRITE_TOKEN")}`
        : env.uploadMode === "presigned"
          ? "URL pré-signées (authentification automatique OIDC de Vercel, sans jeton longue durée)."
          : "Impossible : ni store, ni jeton.",
  });

  if (env.uploadMode === "presigned") {
    try {
      await withTimeout(issueSignedToken({ pathname: "diagnostic/test.txt", operations: ["put"], validUntil: Date.now() + 60_000, abortSignal: AbortSignal.timeout(15000) }));
      checks.push({ ok: true, label: "Autorisation d'envoi (URL pré-signée)", detail: "Accordée." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      checks.push({ ok: false, label: "Autorisation d'envoi (URL pré-signée)", detail: `${explain(msg, !!env.storeId.name)}\n\nMessage technique : ${msg}` });
    }
  }

  let testUrl: string | null = null;
  try {
    const blob = await withTimeout(put("diagnostic/test.txt", "ok", { access: "public", addRandomSuffix: true, contentType: "text/plain", abortSignal: AbortSignal.timeout(15000) }));
    testUrl = blob.url;
    checks.push({ ok: true, label: "Envoi d'un fichier de test (accès public)", detail: "Réussi." });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    checks.push({ ok: false, label: "Envoi d'un fichier de test (accès public)", detail: `${explain(msg, !!env.storeId.name)}\n\nMessage technique : ${msg}` });
  }
  if (testUrl) {
    try {
      await withTimeout(del(testUrl, { abortSignal: AbortSignal.timeout(15000) }));
      checks.push({ ok: true, label: "Suppression du fichier de test", detail: "Réussie." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      checks.push({ ok: false, label: "Suppression du fichier de test", detail: `${explain(msg, !!env.storeId.name)}\n\nMessage technique : ${msg}` });
    }
  }

  return NextResponse.json({ ok: checks.every((c) => c.ok), checks, environment: process.env.VERCEL_ENV ?? "local" });
}
