import { NextRequest, NextResponse } from "next/server";
import { sanitizeClasses } from "@/lib/classes-validation";
import { deleteFichiers } from "@/lib/blob-cleanup";
import { deleteSequence, getSequence, updateSequence } from "@/lib/pedago-repo";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!(await getSequence(id))) return NextResponse.json({ error: "Séquence introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });

  const fields: Parameters<typeof updateSequence>[1] = {};
  if (typeof body.titre === "string") {
    if (!body.titre.trim()) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
    fields.titre = body.titre.trim();
  }
  if (typeof body.description === "string") fields.description = body.description.trim();
  if (body.classes !== undefined) {
    const cls = sanitizeClasses(body.classes);
    if (!cls || cls.length === 0) return NextResponse.json({ error: "Choisis au moins une classe." }, { status: 400 });
    fields.classes = cls;
  }
  await updateSequence(id, fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const fichiers = await deleteSequence(id);
  await deleteFichiers(fichiers);
  return NextResponse.json({ ok: true });
}
