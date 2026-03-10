// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const PLANS = {
  STARTER: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    tokenLimit: 500_000,
    label: "Starter",
    price: "$29/mo",
  },
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    tokenLimit: 5_000_000,
    label: "Pro",
    price: "$99/mo",
  },
  ENTERPRISE: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    tokenLimit: 999_999_999,
    label: "Enterprise",
    price: "Custom",
  },
} as const;
