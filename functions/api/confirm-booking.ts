import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";
import { google } from "googleapis";

const CALENDAR_ID = "connect.sscoach@gmail.com";
const TIMEZONE    = "America/New_York";

function cleanNeonUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return raw;
  }
}

function slotToUTC(dateStr: string, hour: number): Date {
  const noon = new Date(`${dateStr}T12:00:00.000Z`);
  const nyHourAtNoon = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).formatToParts(noon).find((p) => p.type === "hour")!.value
  );
  const offsetHours = nyHourAtNoon - 12;
  const utcHour = hour - offsetHours;
  return new Date(`${dateStr}T${String(utcHour).padStart(2, "0")}:00:00.000Z`);
}

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

  let paymentIntentId: string | null, service: string, date: string,
      time: string, clientName: string, clientEmail: string;

  try {
    const body = await request.json() as {
      paymentIntentId?: string | null;
      service?: string;
      date?: string;
      time?: string;
      clientName?: string;
      clientEmail?: string;
    };
    paymentIntentId = body.paymentIntentId ?? null;
    service         = body.service!;
    date            = body.date!;
    time            = body.time!;
    clientName      = body.clientName!;
    clientEmail     = body.clientEmail!;
    if (!service || !date || !time || !clientName || !clientEmail) {
      throw new Error("Missing fields");
    }
  } catch {
    return new Response(JSON.stringify({ error: "Missing or invalid request body" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const isFree = paymentIntentId === null;
  let amountPaidCents = 0;
  const recordId = isFree
    ? `free_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    : paymentIntentId!;

  if (!isFree) {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId!);
      if (paymentIntent.status !== "succeeded") {
        return new Response(JSON.stringify({ error: "Payment has not succeeded" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      amountPaidCents = paymentIntent.amount;
    } catch (err) {
      console.error("Stripe verification failed:", err);
      return new Response(JSON.stringify({ error: "Payment verification failed" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }

  const sql = neon(cleanNeonUrl(env.NEON_DATABASE_URL));

  try {
    // 1. Idempotency check
    const existing = await sql`
      SELECT * FROM bookings WHERE stripe_payment_id = ${recordId} LIMIT 1
    `;
    if (existing.length > 0) {
      return new Response(JSON.stringify({ booking: existing[0] }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 2. Create Google Calendar event
    let calendarEventId: string | null = null;
    try {
      const oauth2Client = new google.auth.OAuth2(
        env.VITE_GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

      const calendar     = google.calendar({ version: "v3", auth: oauth2Client });
      const hour         = parseInt(time.split(":")[0]);
      const startUTC     = slotToUTC(date, hour);
      const durationMins = isFree ? 30 : 60;
      const endUTC       = new Date(startUTC.getTime() + durationMins * 60 * 1000);

      const calEvent = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        sendUpdates: "all",
        requestBody: {
          summary:     `${isFree ? "Free Consultation" : "Coaching Session"} — ${clientName}`,
          description: `Service: ${service}\nClient: ${clientName}\nEmail: ${clientEmail}`,
          start: { dateTime: startUTC.toISOString(), timeZone: TIMEZONE },
          end:   { dateTime: endUTC.toISOString(),   timeZone: TIMEZONE },
          attendees: [
            { email: CALENDAR_ID },
            { email: clientEmail, displayName: clientName },
          ],
        },
      });

      calendarEventId = calEvent.data.id ?? null;
    } catch (calErr) {
      console.error("Google Calendar event creation failed:", calErr);
    }

    // 3. Write booking to Neon
    const result = await sql`
      INSERT INTO bookings
        (service, date, time, client_name, client_email, amount_paid, stripe_payment_id, calendar_event_id)
      VALUES
        (${service}, ${date}, ${time}, ${clientName}, ${clientEmail},
         ${amountPaidCents}, ${recordId}, ${calendarEventId})
      RETURNING *
    `;
    const booking = result[0];

    // 4. Trigger n8n webhook (fire-and-forget)
    const webhookUrl = env.VITE_N8N_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:       "booking_confirmation",
          service,
          date,
          time,
          clientName,
          clientEmail,
          amountPaid: amountPaidCents / 100,
          bookingId:  booking.id,
        }),
      }).catch((e) => console.error("n8n webhook failed:", e));
    }

    return new Response(JSON.stringify({ booking }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack   = err instanceof Error ? err.stack   : undefined;
    console.error("confirm-booking error:", message);
    if (stack) console.error(stack);
    return new Response(JSON.stringify({ error: "Failed to confirm booking", detail: message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
}