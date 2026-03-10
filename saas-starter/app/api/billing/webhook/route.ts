// app/api/billing/webhook/route.ts
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const { orgId, plan } = sub.metadata;
      if (orgId && plan && PLANS[plan as keyof typeof PLANS]) {
        await prisma.organization.update({
          where: { id: orgId },
          data: { plan: plan as any, stripeSubscriptionId: sub.id, tokenLimit: PLANS[plan as keyof typeof PLANS].tokenLimit },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { orgId } = sub.metadata;
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: { plan: "FREE", stripeSubscriptionId: null, tokenLimit: 100_000 },
        });
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason === "subscription_cycle") {
        await prisma.organization.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data: { monthlyTokenUsage: 0 },
        });
      }
      break;
    }
  }

  return new Response("ok");
}
