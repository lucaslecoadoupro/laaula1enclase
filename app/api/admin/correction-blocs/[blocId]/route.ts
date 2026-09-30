import { NextRequest, NextResponse } from "next/server";
import { sanitizeClasses } from "@/lib/classes-validation";
import { deleteBloc, getBloc, updateBloc } from "@/lib/corrections-repo";

type Ctx = { params: Promise<{ blocId: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { blocId } = await params;
  if (!(await getBloc(blocId))) return NextResponse.json({ error: "Bloc introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });

  const fields: Parameters<typeof updateBloc>[1] = {};
  if (typeof body.titre === "string") fields.titre = body.titre;
  if (typeof body.contenu === "string") fields.contenu = body.contenu;
  if (body.classes !== undefined) {
    const cls = sanitizeClasses(body.classes);
    if (!cls) return NextResponse.json({ error: "Classes invalides." }, { status: 400 });
    fields.classes = cls; // vide autorisé = bloc caché
  }
  await updateBloc(blocId, fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { blocId } = await params;
  await deleteBloc(blocId);
  return NextResponse.json({ ok: true });
}
