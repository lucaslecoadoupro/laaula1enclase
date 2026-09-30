"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_PARCOURS, type Parcours } from "@/lib/remise/content";

const Ctx = createContext<Parcours>(DEFAULT_PARCOURS);

/** Fournit aux composants élèves le parcours (kit + modifications du professeur). */
export function ParcoursProvider({ value, children }: { value: Parcours; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useParcours() {
  return useContext(Ctx);
}
