import type { Metadata } from "next";
import Link from "next/link";
import { getCreations } from "@/lib/musee-repo";
import { classes } from "@/lib/classes";
import PageHeader from "@/components/PageHeader";
import CreationCard from "@/components/CreationCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Musée — El aula 1 en casa" };

export default async function MuseePage({ searchParams }: { searchParams: Promise<{ classe?: string }> }) {
  const { classe } = await searchParams;
  const all = await getCreations();
  // Seules les classes qui ont au moins une œuvre apparaissent dans le filtre.
  const presentes = classes.filter((c) => all.some((x) => x.classe === c.classeSlug));
  const actif = presentes.some((c) => c.classeSlug === classe) ? classe : undefined;
  const creations = actif ? all.filter((c) => c.classe === actif) : all;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader title="Musée" subtitle="Les plus belles créations des élèves en espagnol." />

      {presentes.length > 1 && (
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filtrer par classe">
          <Link href="/musee" className={`chip ${!actif ? "chip-on" : ""}`}>
            Toutes les classes
          </Link>
          {presentes.map((c) => (
            <Link key={c.classeSlug} href={`/musee?classe=${c.classeSlug}`} className={`chip ${actif === c.classeSlug ? "chip-on" : ""}`}>
              {c.classeLabel}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-8">
        {creations.length ? (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
            {creations.map((c) => (
              <CreationCard key={c.id} creation={c} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-ink-soft)]">Les premières œuvres arrivent bientôt !</p>
        )}
      </div>
    </main>
  );
}
