/**
 * POST /api/auth/redefinir-senha
 * Body: { token, senha }
 * Valida token (existência, não usado, não expirado) e troca a senha.
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(20),
  senha: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos." },
      { status: 400 }
    );
  }

  const tok = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!tok || tok.usedAt || tok.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Link inválido ou expirado." },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(parsed.data.senha, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tok.userId },
      data: { password: hash },
    }),
    prisma.passwordResetToken.update({
      where: { id: tok.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
