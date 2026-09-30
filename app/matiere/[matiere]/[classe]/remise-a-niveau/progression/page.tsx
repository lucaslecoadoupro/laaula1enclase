import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ProgressionView from "@/components/remise/ProgressionView";

export default async function ProgressionPage({ params }: { params: Promise<{ matiere: string; classe: string }> }) {
  const { matiere, classe } = await params;
  const base = `/matiere/${matiere}/${classe}/remise-a-niveau`;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <Link href={base} className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        ← Parcours
      </Link>
      <div className="mt-4 mb-8">
        <PageHeader eyebrow="Remise à niveau" title="Ma progression" />
      </div>
      <ProgressionView base={base} />
    </main>
  );
}
