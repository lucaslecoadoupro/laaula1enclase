import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, FolderOpen, LifeBuoy, Newspaper, Presentation } from "lucide-react";
import { getHomeContent } from "@/lib/site-content-repo";
import { getRessources } from "@/lib/ressources-repo";
import { getCoursCounts, getSequences } from "@/lib/pedago-repo";
import PageHeader from "@/components/PageHeader";
import ClassBadges from "@/components/admin/ClassBadges";
import { TONES, TONE_CYCLE } from "@/components/IconTile";
import HomeContentPanel from "./HomeContentPanel";
import RessourcesPanel from "./RessourcesPanel";
import NewSequenceForm from "./SequencesPanel";
import LogoutButton from "./LogoutButton";
import StoragePanel from "./StoragePanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [sequences, counts, homeContent, ressources] = await Promise.all([
    getSequences(),
    getCoursCounts(),
    getHomeContent(),
    getRessources(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow="Espace enseignant"
        title="Mes séquences"
        subtitle="Crée une séquence pour une ou plusieurs classes, ajoute-lui des cours (document, corrigé, entraînement, approfondissement), puis publie."
        aside={<LogoutButton />}
      />

      <div className="mt-8 flex">
        <NewSequenceForm />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sequences.map((s, i) => {
          const c = counts[s.id] ?? { published: 0, total: 0 };
          const tone = TONES[TONE_CYCLE[i % TONE_CYCLE.length]];
          return (
            <Link key={s.id} href={`/admin/sequences/${s.id}`} className="card card-hover accent-ring group flex flex-col gap-3 rounded-3xl p-5">
              <span className={`icon-tile h-11 w-11 ${tone.bg} ${tone.text}`}>
                <FolderOpen size={19} />
              </span>
              <span className="text-lg leading-snug font-bold text-[var(--color-ink)]">{s.titre}</span>
              <ClassBadges slugs={s.classes} />
              <span className="mt-auto flex items-center justify-between pt-2 text-sm text-[var(--color-ink-soft)]">
                {c.total === 0 ? "Aucun cours" : `${c.published} publié${c.published > 1 ? "s" : ""} sur ${c.total} cours`}
                <ArrowRight size={16} className="text-[var(--color-ink-faint)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-teal)]" />
              </span>
            </Link>
          );
        })}
        {sequences.length === 0 && (
          <p className="text-[var(--color-ink-soft)] sm:col-span-2">Aucune séquence pour l&apos;instant — crée la première ci-dessus.</p>
        )}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <AdminShortcut href="/admin/actualites" color="var(--color-coral)" icon={<Newspaper size={21} />} eyebrow="Accueil & classes" title="Fil d'actualité" text="Infos, documents, productions d'élèves." />
        <AdminShortcut href="/tableau" color="var(--color-teal)" icon={<Presentation size={21} />} eyebrow="En classe" title="Tableau de classe" text="Minuteur, tirage au sort, consignes, sonomètre…" />
        <AdminShortcut href="/admin/remise" color="var(--color-sun)" icon={<LifeBuoy size={21} />} eyebrow="Remise à niveau" title="Conexión español" text="Modules, leçons, QCM, bilans, audios." />
      </div>

      <h2 className="mt-14 mb-4 text-xl font-bold text-[var(--color-ink)]">Réglages du site</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <HomeContentPanel initial={homeContent} />
        <RessourcesPanel initial={ressources} />
      </div>
      <div className="mt-6">
        <StoragePanel />
      </div>
    </main>
  );
}

function AdminShortcut({ href, color, icon, eyebrow, title, text }: { href: string; color: string; icon: ReactNode; eyebrow: string; title: string; text: string }) {
  return (
    <Link href={href} className="card card-hover accent-ring group flex items-start gap-4 rounded-3xl p-5">
      <span className="icon-tile h-12 w-12" style={{ color, background: `color-mix(in srgb, ${color} 13%, transparent)` }}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold" style={{ color }}>
          {eyebrow}
        </span>
        <span className="block text-lg font-bold text-[var(--color-ink)]">{title}</span>
        <span className="block text-sm text-[var(--color-ink-soft)]">{text}</span>
      </span>
      <ArrowRight size={18} className="mt-1 text-[var(--color-ink-faint)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-teal)]" />
    </Link>
  );
}
