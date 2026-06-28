/**
 * POST /api/stripe/portal
 *
 * Cria sessão do Stripe Billing Portal para o usuário gerenciar/cancelar
 * a assinatura. Retorna URL para redirecionar.
 *
 * Se Stripe não estiver configurado, retorna 503 com mensagem amigável.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "O portal de assinatura está em modo de teste. Em produção, você poderá cancelar e atualizar cartão por aqui.",
      },
      { status: 503 },
    );
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Você ainda não tem uma assinatura ativa." },
      { status: 400 },
    );
  }
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl()}/conta`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao abrir portal." },
      { status: 500 },
    );
  }
}
