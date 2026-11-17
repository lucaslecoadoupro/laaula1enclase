import { NextRequest, NextResponse } from "next/server";
import { createCreation } from "@/lib/musee-repo";
import { validateCreation } from "./validate";

export async function POST(request: NextRequest) {
  const v = validateCreation(await request.json().catch(() => null));
  if ("error" in v) return NextResponse.json(v, { status: 400 });
  return NextResponse.json({ id: await createCreation(v.data) });
}
