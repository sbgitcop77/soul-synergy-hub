import Stripe from "stripe";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SERVICE_PRICES: Record<string, number> = {
  "Clarity Session":        5000,
  "Align with Goals":      20000,
  "90-Day Transformation": 60000,
  "Pay as You Go":          5000,
};

export async function onRequest(context: {
  request: Request;
  env: Record<string, string>;
}) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers: cors });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: cors,
    });
  }

  let service: string, clientEmail: string, clientName: string,
      promoId: string | undefined, percentOff: number | undefined,
      amountOff: number | undefined;

  try {
    const body = await request.json() as {
      service?: string;
      clientEmail?: string;
      clientName?: string;
      promoId?: string;
      percent_off?: number;
      amount_off?: number;
    };
    service     = body.service!;
    clientEmail = body.clientEmail!;
    clientName  = body.clientName!;
    promoId     = body.promoId;
    percentOff  = body.percent_off;
    amountOff   = body.amount_off;
    if (!service || !clientEmail || !clientName) throw new Error("Missing fields");
  } catch {
    return new Response(JSON.stringify({ error: "Missing or invalid request body" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const baseAmount = SERVICE_PRICES[service];
  if (!baseAmount) {
    return new Response(JSON.stringify({ error: "Unknown service" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let discount = 0;
  if (percentOff) {
    discount = Math.floor(baseAmount * (percentOff / 100));
  } else if (amountOff) {
    discount = Math.min(amountOff, baseAmount);
  }

  const finalAmount = Math.max(baseAmount - discount, 50);
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:               finalAmount,
      currency:             "usd",
      payment_method_types: ["card"],
      receipt_email:        clientEmail,
      metadata: {
        service,
        clientName,
        clientEmail,
        baseAmount:  String(baseAmount),
        discount:    String(discount),
        finalAmount: String(finalAmount),
        ...(promoId ? { promoId } : {}),
      },
    });

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      finalAmount,
    }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-payment-intent error:", err);
    return new Response(JSON.stringify({ error: "Failed to create payment intent" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
}