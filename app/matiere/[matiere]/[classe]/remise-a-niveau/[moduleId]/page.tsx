import { redirect } from "next/navigation";

export default async function ModuleIndex({ params }: { params: Promise<{ matiere: string; classe: string; moduleId: string }> }) {
  const { matiere, classe, moduleId } = await params;
  redirect(`/matiere/${matiere}/${classe}/remise-a-niveau/${moduleId}/decouvrir`);
}
