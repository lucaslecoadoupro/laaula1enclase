import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { findClasseBySlug } from "@/lib/classes";

export async function POST(request: NextRequest, { params }: { params: Promise<{ classe: string }> }) {
  const { classe: classeSlug } = await params;
  const classe = findClasseBySlug(classeSlug);

  if (!classe) {
    return NextResponse.json({ error: "Classe inconnue." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json({ error: "Mot de passe requis." }, { status: 400 });
  }

  const expectedPassword = process.env[classe.passwordEnvVar];
  if (!expectedPassword) {
    console.error(`Variable d'environnement manquante: ${classe.passwordEnvVar}`);
    return NextResponse.json(
      { error: "Accès non configuré pour cette classe. Contacte ton professeur." },
      { status: 500 }
    );
  }

  const valid = verifyPassword(password, expectedPassword);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const token = await createSessionToken(classeSlug);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
  return response;
}
