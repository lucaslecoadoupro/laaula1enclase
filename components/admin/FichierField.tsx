"use client";

import { useRouter } from "next/navigation";
import type { Fichier } from "@/lib/fichier";
import FileUploader from "@/components/admin/FileUploader";

/** Envoie un fichier puis l'enregistre sur un cours ou un exercice via PATCH. */
export default function FichierField({ endpoint, value, label }: { endpoint: string; value: Fichier | null; label?: string }) {
  const router = useRouter();
  return (
    <FileUploader
      value={value}
      label={label}
      onChange={async (fichier) => {
        const res = await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fichier }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Enregistrement du fichier impossible.");
        }
        router.refresh();
      }}
    />
  );
}
