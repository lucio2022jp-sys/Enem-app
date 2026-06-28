import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emailBoasVindas, enviarEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  aceiteTermos: z.boolean().refine((v) => v === true, {
    message: "Você precisa aceitar os termos.",
  }),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 },
    );
  }
  const email = parsed.data.email.toLowerCase();
  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json(
      { error: "Já existe uma conta com este email." },
      { status: 409 },
    );
  }
  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      password: hash,
      role: "ALUNO",
      plan: "FREE",
      aceitouTermosEm: new Date(),
    },
    select: { id: true, name: true, email: true },
  });

  // Email não bloqueia o fluxo
  void enviarEmail({ to: user.email, ...emailBoasVindas(user.name) });

  return NextResponse.json({ ok: true, user });
}
