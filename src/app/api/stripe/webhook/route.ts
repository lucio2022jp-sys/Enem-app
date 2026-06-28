/**
 * Webhook do Stripe.
 *
 * Verifica assinatura, identifica o usuário pelo metadata.userId ou pelo
 * customerId, e atualiza plan/planUntil/stripeSubscriptionId no banco.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, stripeWebhookSecret } from "@/lib/stripe";
import {
  emailRecibo,
  emailPagamentoFalhou,
  enviarEmail,
} from "@/lib/email";

export const runtime = "nodejs";

async function localizarUserId(
  stripe: Stripe,
  evento: Stripe.Event
): Promise<string | null> {
  const obj = evento.data.object as unknown as Record<string, unknown>;
  const meta = (obj.metadata || {}) as Record<string, string>;
  if (meta.userId) return meta.userId;

  const customerId =
    (obj.customer as string | undefined) ||
    ((obj as { customer_id?: string }).customer_id as string | undefined);
  if (customerId) {
    const u = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (u) return u.id;
    // tenta puxar do Stripe customer metadata
    try {
      const c = await stripe.customers.retrieve(customerId);
      if (c && !("deleted" in c)) {
        const userId = (c.metadata?.userId as string | undefined) || null;
        if (userId) return userId;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function dataFimAssinatura(sub: Stripe.Subscription): Date {
  // current_period_end varia entre versões da API (top-level vs item-level).
  // Aceitamos qualquer um sem confiar nos tipos.
  const anySub = sub as unknown as {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  const ts =
    anySub.items?.data?.[0]?.current_period_end ?? anySub.current_period_end;
  if (ts) return new Date(ts * 1000);
  const fallback = new Date();
  fallback.setMonth(fallback.getMonth() + 1);
  return fallback;
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = stripeWebhookSecret();
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe não configurado." },
      { status: 503 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Sem assinatura." }, { status: 400 });
  }

  const body = await req.text();
  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { error: `Assinatura inválida: ${(e as Error).message}` },
      { status: 400 }
    );
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed": {
        const s = evento.data.object as Stripe.Checkout.Session;
        const userId =
          (s.metadata?.userId as string | undefined) ||
          (await localizarUserId(stripe, evento));
        if (!userId) break;

        const subId = (s.subscription as string | null) || null;
        let ate: Date | undefined;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          ate = dataFimAssinatura(sub);
        }

        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            planUntil: ate,
            stripeCustomerId:
              (s.customer as string | null) || undefined,
            stripeSubscriptionId: subId || undefined,
          },
        });

        void enviarEmail({ to: user.email, ...emailRecibo(user.name) });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.resumed": {
        const sub = evento.data.object as Stripe.Subscription;
        const userId = await localizarUserId(stripe, evento);
        if (!userId) break;

        const ativa =
          sub.status === "active" ||
          sub.status === "trialing" ||
          sub.status === "past_due"; // mantém Pro enquanto tenta recobrar
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: ativa ? "PRO" : "FREE",
            planUntil: dataFimAssinatura(sub),
            stripeSubscriptionId: sub.id,
          },
        });
        break;
      }

      case "customer.subscription.paused":
      case "customer.subscription.deleted": {
        const userId = await localizarUserId(stripe, evento);
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "FREE" },
        });
        break;
      }

      case "invoice.paid": {
        const inv = evento.data.object as Stripe.Invoice;
        const userId = await localizarUserId(stripe, evento);
        if (!userId) break;
        const subId =
          (inv as unknown as { subscription?: string }).subscription || null;
        let ate: Date | undefined;
        if (subId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            ate = dataFimAssinatura(sub);
          } catch {
            /* ignore */
          }
        }
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "PRO", planUntil: ate },
        });
        break;
      }

      case "invoice.payment_failed": {
        const userId = await localizarUserId(stripe, evento);
        if (!userId) break;
        const u = await prisma.user.findUnique({ where: { id: userId } });
        if (u) {
          void enviarEmail({ to: u.email, ...emailPagamentoFalhou(u.name) });
        }
        break;
      }

      default:
        // outros eventos: ignora silenciosamente
        break;
    }
  } catch (e) {
    console.error("[stripe-webhook] erro processando evento", evento.type, e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
