import { NextRequest, NextResponse } from "next/server";
import { createRessource, getRessources } from "@/lib/ressources-repo";

export async function GET() {
  const ressources = await getRessources();
  return NextResponse.json({ ressources });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.titre !== "string" || typeof body.url !== "string" || !body.titre || !body.url) {
    return NextResponse.json({ error: "Titre et URL sont requis." }, { status: 400 });
  }

  const id = await createRessource({
    titre: body.titre,
    description: typeof body.description === "string" ? body.description : "",
    url: body.url,
  });

  return NextResponse.json({ id });
}
