import { getActualitesPubliques } from "@/lib/actualites-repo";
import PageHeader from "@/components/PageHeader";
import Feed from "@/components/Feed";

export const dynamic = "force-dynamic";

export default async function ActualitesPage() {
  const actus = await getActualitesPubliques();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader title="Actualités" subtitle="Infos, documents et productions d'élèves." />
      <div className="mt-8">
        {actus.length ? <Feed items={actus} title="" /> : <p className="text-[var(--color-ink-soft)]">Rien pour l&apos;instant.</p>}
      </div>
    </main>
  );
}
