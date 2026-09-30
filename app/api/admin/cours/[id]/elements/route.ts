import { NextRequest, NextResponse } from "next/server";
import { createElement, getCours, reorderElements } from "@/lib/pedago-repo";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!(await getCours(id))) return NextResponse.json({ error: "Cours introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const section = body?.section === "approfondissement" ? "approfondissement" : body?.section === "entrainement" ? "entrainement" : null;
  const type = body?.type === "qcm" ? "qcm" : body?.type === "fichier" ? "fichier" : null;
  const titre = typeof body?.titre === "string" ? body.titre.trim() : "";
  if (!section || !type || !titre) return NextResponse.json({ error: "Section, type et titre requis." }, { status: 400 });
  const elementId = await createElement(id, { section, type, titre });
  return NextResponse.json({ id: elementId });
}

/** Réordonne les éléments du cours : { ids: [...] } */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.ids) || !body.ids.every((x: unknown) => typeof x === "string")) {
    return NextResponse.json({ error: "Liste d'ids invalide." }, { status: 400 });
  }
  await reorderElements(id, body.ids);
  return NextResponse.json({ ok: true });
}
