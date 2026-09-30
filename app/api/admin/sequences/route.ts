import { NextRequest, NextResponse } from "next/server";
import { sanitizeClasses } from "@/lib/classes-validation";
import { createSequence, getSequences, reorderSequences } from "@/lib/pedago-repo";

export async function GET() {
  return NextResponse.json({ sequences: await getSequences() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const titre = typeof body?.titre === "string" ? body.titre.trim() : "";
  if (!titre) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
  const classes = sanitizeClasses(body?.classes);
  if (!classes || classes.length === 0) return NextResponse.json({ error: "Choisis au moins une classe." }, { status: 400 });
  const id = await createSequence({
    titre,
    description: typeof body?.description === "string" ? body.description.trim() : "",
    classes,
  });
  return NextResponse.json({ id });
}

/** Réordonne : { ids: [...] } */
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.ids) || !body.ids.every((x: unknown) => typeof x === "string")) {
    return NextResponse.json({ error: "Liste d'ids invalide." }, { status: 400 });
  }
  await reorderSequences(body.ids);
  return NextResponse.json({ ok: true });
}
