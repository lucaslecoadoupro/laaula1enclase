import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PARCOURS } from "@/lib/remise/content";
import { deleteOverride, setOverride } from "@/lib/remise/repo";
import { sanitizeCheckpoint } from "@/lib/remise/sanitize";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const base = DEFAULT_PARCOURS.checkpoints.find((c) => c.id === id);
  if (!base) return NextResponse.json({ error: "Bilan introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const checkpoint = sanitizeCheckpoint(body?.checkpoint, base);
  if (!checkpoint) return NextResponse.json({ error: "Il faut au moins une question complète (énoncé + deux choix)." }, { status: 400 });
  await setOverride(`checkpoint:${id}`, checkpoint);
  return NextResponse.json({ ok: true, checkpoint });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await deleteOverride(`checkpoint:${id}`);
  return NextResponse.json({ ok: true });
}
