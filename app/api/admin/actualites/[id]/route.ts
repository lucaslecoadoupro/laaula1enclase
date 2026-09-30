import { NextRequest, NextResponse } from "next/server";
import { deleteFichiers } from "@/lib/blob-cleanup";
import { deleteActualite, getActualite, updateActualite } from "@/lib/actualites-repo";
import { validateActu } from "../validate";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const prev = await getActualite(id);
  if (!prev) return NextResponse.json({ error: "Publication introuvable." }, { status: 404 });
  const v = validateActu(await request.json().catch(() => null));
  if ("error" in v) return NextResponse.json(v, { status: 400 });
  await updateActualite(id, v.data);
  if (prev.fichier && prev.fichier.url !== v.data.fichier?.url) await deleteFichiers([prev.fichier]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const prev = await getActualite(id);
  await deleteActualite(id);
  if (prev?.fichier) await deleteFichiers([prev.fichier]);
  return NextResponse.json({ ok: true });
}
