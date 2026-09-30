import { notFound } from "next/navigation";
import { getCoursOfSequence, getElementCounts, getSequence } from "@/lib/pedago-repo";
import Breadcrumb from "@/components/admin/Breadcrumb";
import SequenceMeta from "./SequenceMeta";
import CoursList from "./CoursList";

export const dynamic = "force-dynamic";

export default async function AdminSequencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sequence = await getSequence(id);
  if (!sequence) notFound();
  const [cours, elementCounts] = await Promise.all([getCoursOfSequence(id), getElementCounts()]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ href: "/admin", label: "Mes séquences" }, { label: sequence.titre }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-ink)]">{sequence.titre}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--color-ink)]">Cours</h2>
          <CoursList sequenceId={sequence.id} initial={cours} elementCounts={elementCounts} />
        </section>
        <aside>
          <h2 className="mb-3 text-lg font-bold text-[var(--color-ink)]">Réglages</h2>
          <SequenceMeta key={sequence.updatedAt} sequence={sequence} />
        </aside>
      </div>
    </main>
  );
}
