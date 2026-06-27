import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const APP_PREFIXES = [
  "/inicio",
  "/diagnostico",
  "/trilha",
  "/questoes",
  "/redacao",
  "/simulado",
  "/conta",
  "/planos",
];

const PROFESSOR_PREFIX = "/professor";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await auth();

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
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|map)).*)",
  ],
};
