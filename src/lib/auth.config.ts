import type { NextAuthConfig } from "next-auth";

// Config Edge-safe: sem Prisma, sem bcrypt. Usada pelo middleware.
// A config completa (com Credentials + Prisma) fica em src/lib/auth.ts.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/entrar" },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).plan = token.plan as string;
      }
      return session;
    },
  },
};
