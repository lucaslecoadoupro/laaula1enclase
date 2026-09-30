import { notFound } from "next/navigation";
import { findCheckpoint } from "@/lib/remise/content";
import { getOverrideDates, getParcours } from "@/lib/remise/repo";
import Breadcrumb from "@/components/admin/Breadcrumb";
import BilanEditor from "@/components/admin/BilanEditor";

export const dynamic = "force-dynamic";

export default async function AdminRemiseBilanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [parcours, dates] = await Promise.all([getParcours(), getOverrideDates()]);
  const cp = findCheckpoint(parcours, id.toUpperCase());
  if (!cp) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ href: "/admin", label: "Espace enseignant" }, { href: "/admin/remise", label: "Remise à niveau" }, { label: `Bilan ${cp.id}` }]} />
      <div className="mt-3 mb-8">
        <p className="text-sm font-semibold text-[var(--color-sun)]">Après {cp.afterModule}</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">Bilan {cp.id}</h1>
      </div>
      <BilanEditor
        key={dates[`checkpoint:${cp.id}`] ?? "kit"}
        checkpoint={cp}
        modules={parcours.modules.map((m) => ({ id: m.id, title: m.title }))}
        modified={!!dates[`checkpoint:${cp.id}`]}
      />
    </main>
  );
}
