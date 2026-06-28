/**
 * POST /api/auth/esqueci-senha
 * Gera token e envia email. Responde 200 mesmo se email não existe,
 * pra evitar enumeração de usuários.
 */
import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emailResetSenha, enviarEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true }); // respostagiríca
  }
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expira = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: expira },
  });

  const link = `${appUrl()}/redefinir-senha/${token}`;
  await enviarEmail({ to: user.email, ...emailResetSenha(user.name, link) });

  return NextResponse.json({ ok: true });
}
