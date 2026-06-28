/**
 * Cliente Stripe singleton. Retorna null se a chave não estiver configurada,
 * permitindo modo stub no checkout.
 */
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
  });
  return _stripe;
}

export function stripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "";
}

export function stripePriceId() {
  return process.env.STRIPE_PRICE_ID || "";
}
