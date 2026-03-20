const CALENDAR_ID = "connect.sscoach@gmail.com";
const TIMEZONE    = "America/New_York";
const SLOT_MINS   = 60;
const DAY_START   = 9;
const DAY_END     = 17;

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
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

export async function onRequest(context: {
  request: Request;
  env: Record<string, string>;
}) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers: cors });
  }

  const url = new URL(request.url);
  const year  = parseInt(url.searchParams.get("year")  ?? String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get("month") ?? String(new Date().getMonth() + 1));

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return new Response(JSON.stringify({ error: "Invalid year or month" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const accessToken = await getAccessToken(
      env.VITE_GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REFRESH_TOKEN
    );

    const timeMin = new Date(year, month - 1, 1).toISOString();
    const timeMax = new Date(year, month, 0, 23, 59, 59).toISOString();

    const freeBusyRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        timeZone: TIMEZONE,
        items: [{ id: CALENDAR_ID }],
      }),
    });

    const freeBusyData = await freeBusyRes.json() as {
      calendars: Record<string, { busy: { start: string; end: string }[] }>;
    };

    const busy = freeBusyData.calendars?.[CALENDAR_ID]?.busy ?? [];
    const now  = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    const availability: Record<string, string[]> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const slots: string[] = [];

      for (let hour = DAY_START; hour <= DAY_END; hour++) {
        const slotStart = slotToUTC(dateStr, hour);
        const slotEnd   = new Date(slotStart.getTime() + SLOT_MINS * 60 * 1000);

        if (slotStart <= now) continue;

        const isBusy = busy.some((b) => {
          const bStart = new Date(b.start);
          const bEnd   = new Date(b.end);
          return slotStart < bEnd && slotEnd > bStart;
        });

        if (!isBusy) {
          slots.push(`${String(hour).padStart(2, "0")}:00`);
        }
      }

      if (slots.length > 0) {
        availability[dateStr] = slots;
      }
    }

    return new Response(JSON.stringify(availability), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-availability error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch availability" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
}