import { NextRequest, NextResponse } from "next/server";
import { deleteFichiers } from "@/lib/blob-cleanup";
import { sanitizeFichier } from "@/lib/fichier";
import { getSettings, setOverride } from "@/lib/remise/repo";

/** Remplace (ou retire, avec null) le dossier élève PDF. */
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const f = sanitizeFichier(body?.paperPdf);
  if (f === undefined) return NextResponse.json({ error: "Fichier invalide." }, { status: 400 });
  if (f && f.contentType && f.contentType !== "application/pdf") {
    return NextResponse.json({ error: "Le dossier élève doit être un PDF." }, { status: 400 });
  }
  const previous = await getSettings();
  await setOverride("settings", { ...previous, paperPdf: f });
  if (previous.paperPdf && previous.paperPdf.url !== f?.url) await deleteFichiers([previous.paperPdf]);
  return NextResponse.json({ ok: true });
}
