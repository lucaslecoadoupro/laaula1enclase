import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Memos from "@/components/remise/Memos";

export default async function MemosPage({ params }: { params: Promise<{ matiere: string; classe: string }> }) {
  const { matiere, classe } = await params;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <Link href={`/matiere/${matiere}/${classe}/remise-a-niveau`} className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        ← Parcours
      </Link>
      <div className="mt-4 mb-8">
        <PageHeader eyebrow="Remise à niveau" title="Mémos" subtitle="Toutes les leçons, le lexique, les verbes essentiels et les nombres." />
      </div>
      <Memos />
    </main>
  );
}
