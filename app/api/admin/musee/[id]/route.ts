import { NextRequest, NextResponse } from "next/server";
import { deleteFichiers } from "@/lib/blob-cleanup";
import { deleteCreation, getCreation, updateCreation } from "@/lib/musee-repo";
import { validateCreation } from "../validate";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const prev = await getCreation(id);
  if (!prev) return NextResponse.json({ error: "Création introuvable." }, { status: 404 });
  const v = validateCreation(await request.json().catch(() => null));
  if ("error" in v) return NextResponse.json(v, { status: 400 });
  await updateCreation(id, v.data);
  if (prev.fichier && prev.fichier.url !== v.data.fichier?.url) await deleteFichiers([prev.fichier]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const prev = await getCreation(id);
  await deleteCreation(id);
  if (prev?.fichier) await deleteFichiers([prev.fichier]);
  return NextResponse.json({ ok: true });
}
