import { NextRequest, NextResponse } from "next/server";
import { createCours, getSequence, reorderCours } from "@/lib/pedago-repo";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!(await getSequence(id))) return NextResponse.json({ error: "Séquence introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const titre = typeof body?.titre === "string" ? body.titre.trim() : "";
  if (!titre) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
  const coursId = await createCours(id, titre);
  return NextResponse.json({ id: coursId });
}

/** Réordonne les cours de la séquence : { ids: [...] } */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.ids) || !body.ids.every((x: unknown) => typeof x === "string")) {
    return NextResponse.json({ error: "Liste d'ids invalide." }, { status: 400 });
  }
  await reorderCours(id, body.ids);
  return NextResponse.json({ ok: true });
}
