import type { Handler } from "@netlify/functions";
import Stripe from "stripe";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Prices in cents — must match the frontend services list
const SERVICE_PRICES: Record<string, number> = {
  "Clarity Session":        5000,
  "Align with Goals":      20000,
  "90-Day Transformation": 60000,
  "Pay as You Go":          5000,
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let service: string, clientEmail: string, clientName: string,
      promoId: string | undefined, percentOff: number | undefined,
      amountOff: number | undefined;

  try {
    const body = JSON.parse(event.body ?? "{}");
    service     = body.service;
    clientEmail = body.clientEmail;
    clientName  = body.clientName;
    promoId     = body.promoId;
    percentOff  = body.percent_off;
    amountOff   = body.amount_off;
    if (!service || !clientEmail || !clientName) throw new Error("Missing fields");
  } catch {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing or invalid request body" }),
    };
  }

  const baseAmount = SERVICE_PRICES[service];
  if (!baseAmount) {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unknown service" }),
    };
  }

  // Apply discount server-side to prevent client tampering
  let discount = 0;
  if (percentOff) {
    discount = Math.floor(baseAmount * (percentOff / 100));
  } else if (amountOff) {
    discount = Math.min(amountOff, baseAmount);
  }
  const finalAmount = Math.max(baseAmount - discount, 50); // Stripe minimum is 50 cents

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   finalAmount,
      currency: "usd",
      receipt_email: clientEmail,
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

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        finalAmount,
      }),
    };
  } catch (err) {
    console.error("create-payment-intent error:", err);
    return {
      statusCode: 500,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to create payment intent" }),
    };
  }
};
