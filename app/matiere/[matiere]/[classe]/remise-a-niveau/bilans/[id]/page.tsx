import Link from "next/link";
import { notFound } from "next/navigation";
import { findClasse } from "@/lib/classes";
import { findCheckpoint, findModule } from "@/lib/remise/content";
import { getParcours } from "@/lib/remise/repo";
import PageHeader from "@/components/PageHeader";
import BilanPlayer from "@/components/remise/BilanPlayer";

export default async function BilanPage({ params }: { params: Promise<{ matiere: string; classe: string; id: string }> }) {
  const { matiere, classe: classeSlug, id } = await params;
  const classe = findClasse(matiere, classeSlug);
  const parcours = await getParcours();
  const cp = findCheckpoint(parcours, id.toUpperCase());
  if (!classe || !cp) notFound();
  const base = `/matiere/${matiere}/${classeSlug}/remise-a-niveau`;
  const after = findModule(parcours, cp.afterModule);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <Link href={base} className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        ← Parcours
      </Link>
      <div className="mt-4 mb-8">
        <PageHeader eyebrow="Remise à niveau" title={`Bilan ${cp.id}`} subtitle={`Après ${cp.afterModule}${after ? ` — ${after.title}` : ""}.`} />
      </div>
      <BilanPlayer checkpoint={cp} base={base} />
    </main>
  );
}
