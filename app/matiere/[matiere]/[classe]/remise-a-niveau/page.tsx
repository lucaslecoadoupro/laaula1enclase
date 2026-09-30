import { findClasse } from "@/lib/classes";
import { notFound } from "next/navigation";
import RemiseHome from "@/components/remise/RemiseHome";

export default async function RemisePage({ params }: { params: Promise<{ matiere: string; classe: string }> }) {
  const { matiere, classe: classeSlug } = await params;
  const classe = findClasse(matiere, classeSlug);
  if (!classe) notFound();
  return <RemiseHome base={`/matiere/${matiere}/${classeSlug}/remise-a-niveau`} classeLabel={classe.classeLabel} />;
}
