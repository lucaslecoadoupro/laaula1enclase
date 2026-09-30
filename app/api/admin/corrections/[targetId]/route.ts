import { NextRequest, NextResponse } from "next/server";
import { createBloc, getCorrection, reorderBlocs } from "@/lib/corrections-repo";
import { getCorrectionTarget } from "@/lib/pedago-repo";

type Ctx = { params: Promise<{ targetId: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { targetId } = await params;
  return NextResponse.json({ blocs: await getCorrection(targetId) });
}

/** Ajoute un bloc (caché par défaut) au corrigé d'un cours ou d'un exercice-fichier. */
export async function POST(request: NextRequest, { params }: Ctx) {
  const { targetId } = await params;
  if (!(await getCorrectionTarget(targetId))) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const titre = typeof body?.titre === "string" ? body.titre.trim() : "";
  return NextResponse.json({ bloc: await createBloc(targetId, titre) });
}

/** Réordonne : { ids: [...] } */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { targetId } = await params;
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.ids) || !body.ids.every((x: unknown) => typeof x === "string")) {
    return NextResponse.json({ error: "Liste d'ids invalide." }, { status: 400 });
  }
  await reorderBlocs(targetId, body.ids);
  return NextResponse.json({ ok: true });
}
