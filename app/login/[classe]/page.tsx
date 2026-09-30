import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { findClasseBySlug } from "@/lib/classes";
import AuthCard from "@/components/AuthCard";
import PasswordForm from "@/components/PasswordForm";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ classe: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { classe: classeSlug } = await params;
  const { next } = await searchParams;
  const classe = findClasseBySlug(classeSlug);
  if (!classe) notFound();

  return (
    <AuthCard
      icon={<Lock size={20} />}
      eyebrow={classe.matiereLabel}
      title={classe.classeLabel}
      note="Demande le mot de passe à ton professeur s'il ne t'a pas été communiqué."
    >
      <PasswordForm
        endpoint={`/api/auth/${classeSlug}`}
        next={next && next.startsWith("/") && !next.startsWith("//") ? next : `/matiere/${classe.matiereSlug}/${classeSlug}`}
        label="Mot de passe de la classe"
        submitLabel="Entrer dans ma classe"
      />
    </AuthCard>
  );
}
