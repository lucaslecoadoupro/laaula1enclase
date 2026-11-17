import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCreations } from "@/lib/musee-repo";
import Breadcrumb from "@/components/admin/Breadcrumb";
import CreationCard from "@/components/CreationCard";
import CreationForm from "./CreationForm";
import CreationList from "./CreationList";

export const dynamic = "force-dynamic";

export default async function AdminMuseePage() {
  const creations = await getCreations();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ href: "/admin", label: "Espace enseignant" }, { label: "Musée" }]} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">Musée</h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">Expose les créations de tes élèves, avec leurs prénoms et leur classe.</p>
        </div>
        <Link href="/musee" target="_blank" className="btn btn-ghost !text-sm">
          Voir le Musée <ExternalLink size={14} />
        </Link>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="card rounded-3xl p-5 sm:p-6 lg:sticky lg:top-6">
          <h2 className="mb-4 text-lg font-bold text-[var(--color-ink)]">Nouvelle création</h2>
          <CreationForm />
        </section>
        <section>
          <h2 className="mb-4 text-lg font-bold text-[var(--color-ink)]">
            Œuvres exposées <span className="font-medium text-[var(--color-ink-faint)]">({creations.length})</span>
          </h2>
          <CreationList items={creations.map((c) => ({ creation: c, card: <CreationCard creation={c} /> }))} />
        </section>
      </div>
    </main>
  );
}
