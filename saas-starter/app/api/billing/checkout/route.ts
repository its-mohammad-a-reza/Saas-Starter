export async function POST(req: Request) {
  return new Response("Billing not configured yet", { status: 501 });
}
