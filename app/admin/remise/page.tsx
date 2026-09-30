import Link from "next/link";
import { ArrowRight, ExternalLink, Flag, Volume2, VolumeX } from "lucide-react";
import { classes } from "@/lib/classes";
import { getOverrideDates, getParcours, getSettings } from "@/lib/remise/repo";
import Breadcrumb from "@/components/admin/Breadcrumb";
import PaperPdfField from "@/components/admin/PaperPdfField";

export const dynamic = "force-dynamic";

function Modified() {
  return <span className="rounded-full bg-[var(--color-sun)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-sun)]">Modifié</span>;
}

export default async function AdminRemisePage() {
  const [parcours, dates, settings] = await Promise.all([getParcours(), getOverrideDates(), getSettings()]);
  const first = classes[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ href: "/admin", label: "Espace enseignant" }, { label: "Remise à niveau" }]} />
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-sun)]">Remise à niveau</p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">Conexión español</h1>
          <p className="mt-1 max-w-2xl text-[var(--color-ink-soft)]">
            Modifie les textes, leçons, questions et audios de chaque module. Le kit reste la base : tu peux toujours revenir à sa version d&apos;origine.
          </p>
        </div>
        {first && (
          <Link href={`/matiere/${first.matiereSlug}/${first.classeSlug}/remise-a-niveau`} target="_blank" className="btn btn-ghost ml-auto !py-2 !text-xs">
            Voir comme un élève <ExternalLink size={13} />
          </Link>
        )}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-bold text-[var(--color-ink)]">Modules</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {parcours.modules.map((m) => (
          <Link key={m.id} href={`/admin/remise/modules/${m.id}`} className="card card-hover accent-ring flex flex-col gap-2 rounded-2xl p-4">
            <span className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--color-teal)]">{m.id}</span>
              {dates[`module:${m.id}`] && <Modified />}
              <span className="ml-auto flex items-center gap-1 text-[11px] text-[var(--color-ink-faint)]">
                {m.audio.src ? (
                  <>
                    <Volume2 size={13} className="text-[var(--color-teal)]" /> Audio enregistré
                  </>
                ) : (
                  <>
                    <VolumeX size={13} /> Voix de synthèse
                  </>
                )}
              </span>
            </span>
            <span className="text-lg leading-snug font-bold text-[var(--color-ink)]">{m.title}</span>
            <span className="text-sm text-[var(--color-ink-soft)]">{m.objective}</span>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-bold text-[var(--color-ink)]">Bilans</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {parcours.checkpoints.map((c) => (
          <Link key={c.id} href={`/admin/remise/bilans/${c.id}`} className="card card-hover accent-ring flex items-center gap-3 rounded-2xl p-4">
            <span className="icon-tile h-10 w-10 bg-[var(--color-sun)]/12 text-[var(--color-sun)]">
              <Flag size={17} />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
                Bilan {c.id} {dates[`checkpoint:${c.id}`] && <Modified />}
              </span>
              <span className="block text-xs text-[var(--color-ink-soft)]">
                Après {c.afterModule} · {c.questions.length} questions · seuil {c.threshold}
              </span>
            </span>
            <ArrowRight size={16} className="text-[var(--color-ink-faint)]" />
          </Link>
        ))}
      </div>

      <section className="card mt-10 flex flex-col gap-3 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Dossier élève (fiches papier)</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">
            Le bouton « Ma fiche » ouvre la page correspondant au module (page 1 = S01…). Sans fichier envoyé, c&apos;est le dossier du kit qui est utilisé.
          </p>
        </div>
        <PaperPdfField value={settings.paperPdf ?? null} />
        {!settings.paperPdf && (
          <a href={parcours.paperPdf} target="_blank" rel="noopener noreferrer" className="self-start text-sm text-[var(--color-teal)] hover:underline">
            Ouvrir le dossier du kit
          </a>
        )}
      </section>
    </main>
  );
}
