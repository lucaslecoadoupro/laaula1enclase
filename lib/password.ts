import { timingSafeEqual } from "crypto";

/**
 * Compare un mot de passe saisi à celui configuré (stocké en clair dans une
 * variable d'environnement), en temps constant pour éviter les attaques par
 * mesure de timing.
 */
export function verifyPassword(input: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
