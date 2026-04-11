import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";

const CALENDAR_ID = "connect.sscoach@gmail.com";
const TIMEZONE    = "America/New_York";
const TENANT_ID   = 1;
const COACH_ID    = 1;

// Maps service name → session_type enum
const SESSION_TYPE_MAP: Record<string, string> = {
  "Free Consultation":    "free_consultation",
  "Clarity Session":      "paid_session",
  "Align with Goals":     "paid_session",
  "90-Day Transformation":"paid_session",
  "Pay as You Go":        "paid_session",
};

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

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
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

  // ── Parse request body ────────────────────────────────────────────────────
  let paymentIntentId: string | null,
      service: string,
      date: string,
      time: string,
      clientName: string,
      clientEmail: string;

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
    return new Response(
      JSON.stringify({ error: "Missing or invalid request body" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  const isFree = paymentIntentId === null;
  let amountPaidCents = 0;

  // ── Verify Stripe payment (paid bookings only) ────────────────────────────
  if (!isFree) {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId!);
      if (paymentIntent.status !== "succeeded") {
        return new Response(
          JSON.stringify({ error: "Payment has not succeeded" }),
          { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }
      amountPaidCents = paymentIntent.amount;
    } catch (err) {
      console.error("Stripe verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }
  }

  const sql = neon(cleanNeonUrl(env.NEON_DATABASE_URL));

  try {
    // ── 1. Idempotency check (sessions table via stripe_payment_intent on payments) ──
    if (!isFree) {
      const existing = await sql`
        SELECT s.id, s.scheduled_at, s.type, s.status, s.calendar_event_id,
               c.first_name, c.last_name, c.email,
               p.amount, p.stripe_payment_intent
        FROM payments p
        JOIN sessions s ON s.id = p.session_id
        JOIN contacts c ON c.id = s.contact_id
        WHERE p.stripe_payment_intent = ${paymentIntentId}
        LIMIT 1
      `;
      if (existing.length > 0) {
        const row = existing[0];
        return new Response(JSON.stringify({
          booking: {
            id:                String(row.id),
            service,
            date,
            time,
            client_name:       `${row.first_name} ${row.last_name}`.trim(),
            client_email:      row.email,
            amount_paid:       row.amount,
            stripe_payment_id: row.stripe_payment_intent,
            calendar_event_id: row.calendar_event_id,
          }
        }), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
    }

    // ── 2. Create Google Calendar event ──────────────────────────────────────
    let calendarEventId: string | null = null;
    try {
      const accessToken = await getAccessToken(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REFRESH_TOKEN
      );

      const hour         = parseInt(time.split(":")[0]);
      const startUTC     = slotToUTC(date, hour);
      const durationMins = isFree ? 30 : 60;
      const endUTC       = new Date(startUTC.getTime() + durationMins * 60 * 1000);

      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?sendUpdates=all`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type":  "application/json",
          },
          body: JSON.stringify({
            summary:     `${isFree ? "Free Consultation" : "Coaching Session"} — ${clientName}`,
            description: `Service: ${service}\nClient: ${clientName}\nEmail: ${clientEmail}`,
            start: { dateTime: startUTC.toISOString(), timeZone: TIMEZONE },
            end:   { dateTime: endUTC.toISOString(),   timeZone: TIMEZONE },
            attendees: [
              { email: CALENDAR_ID },
              { email: clientEmail, displayName: clientName },
            ],
          }),
        }
      );

      const calData = await calRes.json() as { id?: string };
      calendarEventId = calData.id ?? null;
    } catch (calErr) {
      console.error("Google Calendar event creation failed:", calErr);
      // Non-fatal — continue with booking
    }

    // ── 3. Upsert contact ─────────────────────────────────────────────────────
    const nameParts  = clientName.trim().split(/\s+/);
    const firstName  = nameParts[0] ?? "";
    const lastName   = nameParts.slice(1).join(" ") ?? "";
    const contactType = isFree ? "consultation" : "paying_client";

    const contactRows = await sql`
      INSERT INTO contacts
        (tenant_id, first_name, last_name, email, type, referral_source, last_interaction)
      VALUES
        (${TENANT_ID}, ${firstName}, ${lastName}, ${clientEmail.toLowerCase()},
         ${contactType}::contact_type, 'booking', NOW())
      ON CONFLICT (tenant_id, email) DO UPDATE SET
        type             = EXCLUDED.type,
        last_interaction = NOW(),
        updated_at       = NOW()
      RETURNING id, first_name, last_name, email
    `;
    const contact = contactRows[0];

    // ── 4. Insert session ─────────────────────────────────────────────────────
    const hour          = parseInt(time.split(":")[0]);
    const scheduledAt   = slotToUTC(date, hour);
    const sessionType   = SESSION_TYPE_MAP[service] ?? "paid_session";
    const meetingUrl    = "https://meet.google.com/pcn-mqgs-jsj";
    const durationMins  = isFree ? 30 : 60;

    const sessionRows = await sql`
      INSERT INTO sessions
        (tenant_id, contact_id, coach_id, type, status, scheduled_at,
         duration_mins, calendar_event_id, meeting_url)
      VALUES
        (${TENANT_ID}, ${contact.id}, ${COACH_ID},
         ${sessionType}::session_type, 'scheduled'::session_status,
         ${scheduledAt.toISOString()}, ${durationMins},
         ${calendarEventId}, ${meetingUrl})
      RETURNING id, scheduled_at, calendar_event_id
    `;
    const session = sessionRows[0];

    // ── 5. Insert payment (paid only) ─────────────────────────────────────────
    if (!isFree) {
      await sql`
        INSERT INTO payments
          (tenant_id, contact_id, session_id, stripe_payment_intent,
           amount, currency, status)
        VALUES
          (${TENANT_ID}, ${contact.id}, ${session.id}, ${paymentIntentId},
           ${amountPaidCents}, 'usd', 'succeeded'::payment_status)
      `;
    }

    // ── 6. Log interaction ────────────────────────────────────────────────────
    await sql`
      INSERT INTO interactions
        (tenant_id, contact_id, session_id, direction, channel, subject, body, workflow_id)
      VALUES
        (${TENANT_ID}, ${contact.id}, ${session.id},
         'inbound'::interaction_direction,
         'webhook'::interaction_channel,
         'Booking Confirmed',
         ${`Booking confirmed via /book — service: ${service}, session id: ${session.id}`},
         'confirm-booking')
    `;

    // ── 7. Fire WF_BOOKING webhook (awaited — Cloudflare kills fire-and-forget) ──
    const webhookUrl = env.VITE_N8N_BOOKING_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
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
            bookingId:   String(session.id),
          }),
        });
      } catch (e) {
        console.error("n8n webhook failed:", e);
        // Non-fatal — booking is already saved
      }
    }

    // ── 8. Return response shaped like legacy Booking type (Book.tsx compatible) ──
    return new Response(JSON.stringify({
      booking: {
        id:                String(session.id),
        service,
        date,
        time,
        client_name:       clientName,
        client_email:      clientEmail,
        amount_paid:       amountPaidCents,
        stripe_payment_id: paymentIntentId ?? `free_${session.id}`,
        calendar_event_id: calendarEventId,
      }
    }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack   = err instanceof Error ? err.stack   : undefined;
    console.error("confirm-booking error:", message);
    if (stack) console.error(stack);
    return new Response(
      JSON.stringify({ error: "Failed to confirm booking", detail: message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
}
