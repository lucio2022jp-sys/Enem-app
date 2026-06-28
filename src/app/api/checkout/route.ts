import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, stripePriceId } from "@/lib/stripe";
import { emailRecibo, enviarEmail } from "@/lib/email";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const stripe = getStripe();
  const priceId = stripePriceId();

  // Modo stub: sem Stripe configurado, ativa direto. Útil em dev.
  if (!stripe || !priceId) {
    const ate = new Date();
    ate.setMonth(ate.getMonth() + 1);
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "PRO", planUntil: ate },
    });
    void enviarEmail({ to: user.email, ...emailRecibo(user.name) });
    return NextResponse.json({
      ok: true,
      stub: true,
      url: `${appUrl()}/planos/sucesso?stub=1`,
    });
  }

  // Garante stripeCustomer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl()}/planos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/planos/cancelado`,
    allow_promotion_codes: true,
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
  });

  return NextResponse.json({ ok: true, url: checkout.url });
}
