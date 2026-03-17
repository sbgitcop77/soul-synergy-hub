import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";
import { google } from "googleapis";

const CALENDAR_ID = "connect.sscoach@gmail.com";
const TIMEZONE    = "America/New_York";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let paymentIntentId: string | null, service: string, date: string,
      time: string, clientName: string, clientEmail: string;

  try {
    const body = JSON.parse(event.body ?? "{}");
    paymentIntentId = body.paymentIntentId ?? null;
    service         = body.service;
    date            = body.date;
    time            = body.time;
    clientName      = body.clientName;
    clientEmail     = body.clientEmail;
    if (!service || !date || !time || !clientName || !clientEmail) {
      throw new Error("Missing fields");
    }
  } catch {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing or invalid request body" }),
    };
  }

  const isFree = paymentIntentId === null;
  const sql    = neon(process.env.NEON_DATABASE_URL!);

  // For paid bookings: verify payment via Stripe
  let amountPaidCents = 0;
  const recordId = isFree
    ? `free_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    : paymentIntentId!;

  if (!isFree) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId!);
      if (paymentIntent.status !== "succeeded") {
        return {
          statusCode: 400,
          headers: { ...cors, "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Payment has not succeeded" }),
        };
      }
      amountPaidCents = paymentIntent.amount;
    } catch (err) {
      console.error("Stripe verification failed:", err);
      return {
        statusCode: 500,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Payment verification failed" }),
      };
    }
  }

  try {
    // 1. Idempotency — return existing booking if already confirmed
    const existing = await sql`
      SELECT * FROM bookings WHERE stripe_payment_id = ${recordId} LIMIT 1
    `;
    if (existing.length > 0) {
      return {
        statusCode: 200,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({ booking: existing[0] }),
      };
    }

    // 2. Create Google Calendar event
    let calendarEventId: string | null = null;
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.VITE_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

      const calendar       = google.calendar({ version: "v3", auth: oauth2Client });
      const hour           = parseInt(time.split(":")[0]);
      const startUTC       = slotToUTC(date, hour);
      const durationMins   = isFree ? 30 : 60;
      const endUTC         = new Date(startUTC.getTime() + durationMins * 60 * 1000);

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
      // Log but don't fail the booking — calendar is non-critical
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

    // 4. Trigger n8n webhook for confirmation email (fire-and-forget)
    const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:        "booking_confirmation",
          service,
          date,
          time,
          clientName,
          clientEmail,
          amountPaid:  amountPaidCents / 100,
          bookingId:   booking.id,
        }),
      }).catch((e) => console.error("n8n webhook failed:", e));
    }

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ booking }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack   = err instanceof Error ? err.stack   : undefined;
    console.error("confirm-booking error:", message);
    if (stack) console.error(stack);
    return {
      statusCode: 500,
      headers: { ...cors, "Content-Type": "application/json" },
      // detail is included so you can see it in the browser network tab
      body: JSON.stringify({ error: "Failed to confirm booking", detail: message }),
    };
  }
};
