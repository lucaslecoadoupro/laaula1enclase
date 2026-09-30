import { NextRequest, NextResponse } from "next/server";
import { deleteFichiers } from "@/lib/blob-cleanup";
import { sanitizeFichier } from "@/lib/fichier";
import { deleteElement, getElement, updateElement } from "@/lib/pedago-repo";
import { sanitizeQuestions } from "@/lib/qcm";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const el = await getElement(id);
  if (!el) return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });

  const fields: Parameters<typeof updateElement>[1] = {};
  if (typeof body.titre === "string") {
    if (!body.titre.trim()) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
    fields.titre = body.titre.trim();
  }
  if (typeof body.consigne === "string") fields.consigne = body.consigne;
  if (body.fichier !== undefined) {
    const f = sanitizeFichier(body.fichier);
    if (f === undefined) return NextResponse.json({ error: "Fichier invalide." }, { status: 400 });
    fields.fichier = f;
  }
  if (body.questions !== undefined) {
    const q = sanitizeQuestions(body.questions);
    if (!q) return NextResponse.json({ error: "Questions invalides (au moins deux choix par question)." }, { status: 400 });
    fields.questions = q;
  }

  await updateElement(id, fields);
  if (fields.fichier !== undefined && el.fichier && el.fichier.url !== fields.fichier?.url) {
    await deleteFichiers([el.fichier]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await deleteFichiers(await deleteElement(id));
  return NextResponse.json({ ok: true });
}
