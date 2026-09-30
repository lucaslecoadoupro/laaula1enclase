import { classes } from "@/lib/classes";

const knownSlugs = new Set(classes.map((c) => c.classeSlug));

/** Garde uniquement les classeSlug connus, sans doublon. `null` si ce n'est pas un tableau. */
export function sanitizeClasses(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const list = value.filter((v): v is string => typeof v === "string" && knownSlugs.has(v));
  return Array.from(new Set(list));
}
