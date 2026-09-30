import { NextRequest, NextResponse } from "next/server";
import { deleteRessource, updateRessource } from "@/lib/ressources-repo";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const fields: Partial<{ titre: string; description: string; url: string }> = {};
  if (typeof body.titre === "string") fields.titre = body.titre;
  if (typeof body.description === "string") fields.description = body.description;
  if (typeof body.url === "string") fields.url = body.url;

  await updateRessource(id, fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteRessource(id);
  return NextResponse.json({ ok: true });
}
