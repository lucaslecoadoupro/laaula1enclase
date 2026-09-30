import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_COOKIE, verifyAdminSessionToken, verifySessionToken } from "@/lib/auth";

export const config = {
  matcher: ["/matiere/:matiere/:classe/:path*", "/admin/:path*", "/api/admin/:path*", "/tableau/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Zone admin (tableau de bord, import, édition, API admin) ---
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/tableau")) {
    if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();

    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
    const isAdmin = await verifyAdminSessionToken(adminToken);
    if (isAdmin) return NextResponse.next();

    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Zone élève (une classe = un mot de passe) ---
  const segments = pathname.split("/").filter(Boolean);
  // segments = ["matiere", "<matiere>", "<classe>", ...]
  const classeSlug = segments[2];
  if (!classeSlug) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (session?.classe === classeSlug) {
    return NextResponse.next();
  }

  // Le professeur connecté peut consulter n'importe quelle classe (aperçu élève).
  if (await verifyAdminSessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const loginUrl = new URL(`/login/${classeSlug}`, request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}
