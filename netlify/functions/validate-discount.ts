import type { Handler } from "@netlify/functions";
import Stripe from "stripe";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let code: string;
  try {
    ({ code } = JSON.parse(event.body ?? "{}"));
    if (!code) throw new Error("Missing code");
  } catch {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing or invalid request body" }),
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const promos = await stripe.promotionCodes.list({ code, active: true, limit: 1 });

    if (promos.data.length === 0) {
      return {
        statusCode: 200,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({ valid: false }),
      };
    }

    const promo  = promos.data[0];
    const coupon = promo.coupon;

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({
        valid:       true,
        promoId:     promo.id,
        percent_off: coupon.percent_off ?? null,
        amount_off:  coupon.amount_off  ?? null, // in cents
        name:        coupon.name ?? code,
      }),
    };
  } catch (err) {
    console.error("validate-discount error:", err);
    return {
      statusCode: 500,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to validate discount code" }),
    };
  }
};
