"use client";

import { useRouter } from "next/navigation";
import type { Fichier } from "@/lib/fichier";
import FileUploader from "./FileUploader";

export default function PaperPdfField({ value }: { value: Fichier | null }) {
  const router = useRouter();
  return (
    <FileUploader
      value={value}
      label="le dossier élève (PDF)"
      folder="remise"
      accept="application/pdf,.pdf"
      onChange={async (paperPdf) => {
        const res = await fetch("/api/admin/remise/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paperPdf }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Enregistrement impossible.");
        }
        router.refresh();
      }}
    />
  );
}
