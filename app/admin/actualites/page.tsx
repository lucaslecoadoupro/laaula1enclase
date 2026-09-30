import { getActualites } from "@/lib/actualites-repo";
import Breadcrumb from "@/components/admin/Breadcrumb";
import FeedCard from "@/components/FeedCard";
import ActuForm from "./ActuForm";
import ActuList from "./ActuList";

export const dynamic = "force-dynamic";

export default async function AdminActualitesPage() {
  const actus = await getActualites();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ href: "/admin", label: "Espace enseignant" }, { label: "Fil d'actualité" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-ink)]">Fil d&apos;actualité</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">Diffuse des infos, des documents et les belles productions de tes élèves.</p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="card rounded-3xl p-5 sm:p-6 lg:sticky lg:top-6">
          <h2 className="mb-4 text-lg font-bold text-[var(--color-ink)]">Nouvelle publication</h2>
          <ActuForm />
        </section>
        <section>
          <h2 className="mb-4 text-lg font-bold text-[var(--color-ink)]">Publications</h2>
          <ActuList items={actus.map((a) => ({ actu: a, card: <FeedCard actu={a} showAudience /> }))} />
        </section>
      </div>
    </main>
  );
}
