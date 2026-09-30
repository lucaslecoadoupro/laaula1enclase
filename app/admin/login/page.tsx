import { ShieldCheck } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import PasswordForm from "@/components/PasswordForm";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthCard icon={<ShieldCheck size={20} />} eyebrow="Espace enseignant" title="Connexion">
      <PasswordForm
        endpoint="/api/admin/login"
        next={next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin"}
        label="Mot de passe professeur"
        submitLabel="Entrer"
      />
    </AuthCard>
  );
}
