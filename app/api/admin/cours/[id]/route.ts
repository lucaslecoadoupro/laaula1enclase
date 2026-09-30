import { NextRequest, NextResponse } from "next/server";
import { deleteFichiers } from "@/lib/blob-cleanup";
import { sanitizeFichier } from "@/lib/fichier";
import { deleteCours, getCours, updateCours } from "@/lib/pedago-repo";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const cours = await getCours(id);
  if (!cours) return NextResponse.json({ error: "Cours introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });

  const fields: Parameters<typeof updateCours>[1] = {};
  if (typeof body.titre === "string") {
    if (!body.titre.trim()) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
    fields.titre = body.titre.trim();
  }
  if (typeof body.description === "string") fields.description = body.description;
  if (body.status === "draft" || body.status === "published") fields.status = body.status;
  if (body.fichier !== undefined) {
    const f = sanitizeFichier(body.fichier);
    if (f === undefined) return NextResponse.json({ error: "Fichier invalide." }, { status: 400 });
    fields.fichier = f;
  }

  await updateCours(id, fields);
  // Fichier remplacé ou retiré : on efface l'ancien du stockage.
  if (fields.fichier !== undefined && cours.fichier && cours.fichier.url !== fields.fichier?.url) {
    await deleteFichiers([cours.fichier]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await deleteFichiers(await deleteCours(id));
  return NextResponse.json({ ok: true });
}
