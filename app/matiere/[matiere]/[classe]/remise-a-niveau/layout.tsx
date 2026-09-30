import type { ReactNode } from "react";
import { getParcours } from "@/lib/remise/repo";
import { ParcoursProvider } from "@/components/remise/ParcoursContext";

export const dynamic = "force-dynamic";

export default async function RemiseLayout({ children }: { children: ReactNode }) {
  const parcours = await getParcours();
  return <ParcoursProvider value={parcours}>{children}</ParcoursProvider>;
}
