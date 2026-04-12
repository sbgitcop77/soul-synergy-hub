import Stripe from "stripe";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  let code: string;
  try {
    const body = await request.json() as { code?: string };
    if (!body.code) throw new Error("Missing code");
    code = body.code;
  } catch {
    return new Response(JSON.stringify({ error: "Missing or invalid request body" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const promos = await stripe.promotionCodes.list({ code, active: true, limit: 1 });

    if (promos.data.length === 0) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const promo = promos.data[0];
    const couponId = (promo as any).promotion?.coupon;
    if (!couponId) throw new Error("No coupon found on promotion code");

    const coupon = await stripe.coupons.retrieve(couponId);

    return new Response(JSON.stringify({
      valid:       true,
      promoId:     promo.id,
      percent_off: coupon.percent_off ?? null,
      amount_off:  coupon.amount_off  ?? null,
      name:        coupon.name ?? code,
    }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("validate-discount error:", err);
    return new Response(JSON.stringify({ error: "Failed to validate discount code", detail: String(err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
}