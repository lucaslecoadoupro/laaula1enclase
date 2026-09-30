import { notFound } from "next/navigation";
import { findClasse } from "@/lib/classes";
import { findModule, isStep } from "@/lib/remise/content";
import { getParcours } from "@/lib/remise/repo";
import ModulePlayer from "@/components/remise/ModulePlayer";

export default async function ModuleStepPage({
  params,
}: {
  params: Promise<{ matiere: string; classe: string; moduleId: string; step: string }>;
}) {
  const { matiere, classe: classeSlug, moduleId, step } = await params;
  const classe = findClasse(matiere, classeSlug);
  const m = findModule(await getParcours(), moduleId.toUpperCase());
  if (!classe || !m || !isStep(step)) notFound();
  return <ModulePlayer module={m} step={step} base={`/matiere/${matiere}/${classeSlug}/remise-a-niveau`} />;
}
