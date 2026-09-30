import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { classes } from "@/lib/classes";
import { findModule } from "@/lib/remise/content";
import { getOverrideDates, getParcours } from "@/lib/remise/repo";
import Breadcrumb from "@/components/admin/Breadcrumb";
import ModuleEditor from "@/components/admin/ModuleEditor";

export const dynamic = "force-dynamic";

export default async function AdminRemiseModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [parcours, dates] = await Promise.all([getParcours(), getOverrideDates()]);
  const m = findModule(parcours, id.toUpperCase());
  if (!m) notFound();
  const first = classes[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ href: "/admin", label: "Espace enseignant" }, { href: "/admin/remise", label: "Remise à niveau" }, { label: m.id }]} />
      <div className="mt-3 mb-8 flex flex-wrap items-end gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-teal)]">
            Module {m.id} · fiche page {m.paperPage}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">{m.title}</h1>
        </div>
        {first && (
          <Link
            href={`/matiere/${first.matiereSlug}/${first.classeSlug}/remise-a-niveau/${m.id}/decouvrir`}
            target="_blank"
            className="btn btn-ghost ml-auto !py-2 !text-xs"
          >
            Voir comme un élève <ExternalLink size={13} />
          </Link>
        )}
      </div>
      <ModuleEditor key={dates[`module:${m.id}`] ?? "kit"} module={m} modified={!!dates[`module:${m.id}`]} />
    </main>
  );
}
