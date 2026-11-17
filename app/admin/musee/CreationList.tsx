"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Creation } from "@/lib/musee";
import CreationForm from "./CreationForm";

/** Liste admin : chaque œuvre (rendue côté serveur) avec Modifier / Supprimer. */
export default function CreationList({ items }: { items: { creation: Creation; card: ReactNode }[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);

  async function remove(c: Creation) {
    const nom = c.titre ? `« ${c.titre} »` : `la création de ${c.prenoms}`;
    if (!confirm(`Retirer ${nom} du Musée ? Le fichier sera aussi supprimé.`)) return;
    await fetch(`/api/admin/musee/${c.id}`, { method: "DELETE" });
    router.refresh();
  }

  if (items.length === 0) return <p className="text-[var(--color-ink-soft)]">Le Musée est vide pour l&apos;instant.</p>;

  return (
    <div className="columns-1 gap-4 md:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
      {items.map(({ creation, card }) =>
        editing === creation.id ? (
          <div key={creation.id} className="card rounded-3xl p-5 sm:p-6">
            <CreationForm initial={creation} onDone={() => setEditing(null)} />
          </div>
        ) : (
          <div key={creation.id} className="relative [&_h3]:pr-20">
            {card}
            <div className="absolute top-3 right-3 flex gap-1.5">
              <button type="button" onClick={() => setEditing(creation.id)} className="btn btn-ghost !bg-[var(--color-bg-deep)]/90 !px-2.5 !py-1.5" aria-label="Modifier">
                <Pencil size={14} />
              </button>
              <button type="button" onClick={() => remove(creation)} className="btn btn-danger !bg-[var(--color-bg-deep)]/90 !px-2.5 !py-1.5" aria-label="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
