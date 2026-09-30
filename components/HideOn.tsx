"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Masque son contenu sur les pages plein écran (ex. le tableau de classe). */
export default function HideOn({ prefix, children }: { prefix: string; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  return pathname.startsWith(prefix) ? null : <>{children}</>;
}
