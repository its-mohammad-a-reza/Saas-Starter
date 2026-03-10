// app/api/billing/checkout/route.ts
import { prisma } from "@/lib/db";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: Request) {
  const { orgId, plan } = await req.json();

  if (!orgId || !PLANS[plan as keyof typeof PLANS]) {
    return new Response("Invalid request", { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return new Response("Org not found", { status: 404 });

  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ name: org.name, metadata: { orgId } });
    customerId = customer.id;
    await prisma.organization.update({ where: { id: orgId }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PLANS[plan as keyof typeof PLANS].priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    metadata: { orgId, plan },
    subscription_data: { metadata: { orgId, plan } },
  });

  return Response.json({ url: session.url });
}
