import { ExternalLink, FileText } from "lucide-react";
import { getRessources } from "@/lib/ressources-repo";
import PageHeader from "@/components/PageHeader";
import IconTile, { TONE_CYCLE } from "@/components/IconTile";

export const dynamic = "force-dynamic";

export default async function RessourcesPage() {
  const ressources = await getRessources();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader
        title="Ressources"
        subtitle="Fiches méthode, sites de référence et compléments — accessibles à tous, sans mot de passe."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ressources.map((item, i) => (
          <IconTile
            key={item.id}
            href={item.url}
            icon={<FileText size={18} />}
            title={item.titre}
            description={item.description || undefined}
            tone={TONE_CYCLE[i % TONE_CYCLE.length]}
            badge={<ExternalLink size={15} className="mt-1 text-[var(--color-ink-faint)]" />}
          />
        ))}
        {ressources.length === 0 && <p className="text-[var(--color-ink-soft)]">Aucune ressource pour l&apos;instant.</p>}
      </div>
    </main>
  );
}
