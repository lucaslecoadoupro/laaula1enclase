import { NextRequest, NextResponse } from "next/server";
import { updateHomeContent } from "@/lib/site-content-repo";

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title : "";
  const subtitle = typeof body.subtitle === "string" ? body.subtitle : "";
  const message = typeof body.message === "string" ? body.message : "";

  await updateHomeContent({ title, subtitle, message });
  return NextResponse.json({ ok: true });
}
