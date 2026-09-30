import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "class_session";
export const ADMIN_COOKIE = "admin_session";
const SESSION_DURATION = "30d";
const ADMIN_SESSION_DURATION = "7d";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET manquant. Ajoute une variable d'environnement SESSION_SECRET (chaîne aléatoire longue) sur Vercel et en local dans .env.local."
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  classe: string;
};

/** Crée un token signé prouvant que l'accès à `classeSlug` a été validé. */
export async function createSessionToken(classeSlug: string) {
  return new SignJWT({ classe: classeSlug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

/** Vérifie un token de session. Retourne le payload si valide, sinon `null`. */
export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.classe !== "string") return null;
    return { classe: payload.classe };
  } catch {
    return null;
  }
}

/** Crée un token signé prouvant un accès admin (professeur). */
export async function createAdminSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_SESSION_DURATION)
    .sign(getSecret());
}

/** Vérifie un token de session admin. Retourne `true` si valide. */
export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
