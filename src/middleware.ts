import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const APP_PREFIXES = [
  "/inicio",
  "/diagnostico",
  "/trilha",
  "/questoes",
  "/redacao",
  "/simulado",
  "/conta",
  "/planos",
  "/mapa",
  "/painel",
];

const PROFESSOR_PREFIX = "/professor";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isProfessor = pathname === PROFESSOR_PREFIX || pathname.startsWith(PROFESSOR_PREFIX + "/");

  if ((isApp || isProfessor) && !session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isProfessor && session?.user) {
    const role = (session.user as any).role;
    if (role !== "PROFESSOR" && role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/inicio";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|map)).*)",
  ],
};
