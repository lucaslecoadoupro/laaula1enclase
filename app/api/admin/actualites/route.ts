import { NextRequest, NextResponse } from "next/server";
import { createActualite } from "@/lib/actualites-repo";
import { validateActu } from "./validate";

export async function POST(request: NextRequest) {
  const v = validateActu(await request.json().catch(() => null));
  if ("error" in v) return NextResponse.json(v, { status: 400 });
  return NextResponse.json({ id: await createActualite(v.data) });
}
