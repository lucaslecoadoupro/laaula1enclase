"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Actualite } from "@/lib/actualites";
import ActuForm from "./ActuForm";

/** Liste admin : chaque carte (rendue côté serveur) avec Modifier / Supprimer. */
export default function ActuList({ items }: { items: { actu: Actualite; card: ReactNode }[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);

  async function remove(a: Actualite) {
    if (!confirm(`Supprimer « ${a.titre} » ? Le fichier joint sera aussi supprimé.`)) return;
    await fetch(`/api/admin/actualites/${a.id}`, { method: "DELETE" });
    router.refresh();
  }

  if (items.length === 0) return <p className="text-[var(--color-ink-soft)]">Aucune publication pour l&apos;instant.</p>;

  return (
    <div className="flex flex-col gap-4">
      {items.map(({ actu, card }) =>
        editing === actu.id ? (
          <div key={actu.id} className="card rounded-3xl p-5 sm:p-6">
            <ActuForm initial={actu} onDone={() => setEditing(null)} />
          </div>
        ) : (
          <div key={actu.id} className="relative">
            {card}
            <div className="absolute top-3 right-3 flex gap-1.5">
              <button type="button" onClick={() => setEditing(actu.id)} className="btn btn-ghost !bg-[var(--color-bg-deep)]/90 !px-2.5 !py-1.5" aria-label="Modifier">
                <Pencil size={14} />
              </button>
              <button type="button" onClick={() => remove(actu)} className="btn btn-danger !bg-[var(--color-bg-deep)]/90 !px-2.5 !py-1.5" aria-label="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
