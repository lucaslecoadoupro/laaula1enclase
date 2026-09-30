import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/auth";

/** Vrai si la requête vient du professeur connecté (pour afficher les brouillons en aperçu). */
export async function isAdminRequest() {
  const store = await cookies();
  return verifyAdminSessionToken(store.get(ADMIN_COOKIE)?.value);
}
