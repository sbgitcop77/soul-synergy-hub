import type { Handler } from "@netlify/functions";
import { google } from "googleapis";

const CALENDAR_ID = "connect.sscoach@gmail.com";
const TIMEZONE    = "America/New_York";
const SLOT_MINS   = 60;
const DAY_START   = 9;  // 9am EST
const DAY_END     = 17; // last slot at 5pm EST (ends 6pm)

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

/**
 * Given a date string (YYYY-MM-DD) and an hour in America/New_York,
 * return the equivalent UTC Date. Uses noon-UTC as a DST-aware reference.
 */
function slotToUTC(dateStr: string, hour: number): Date {
  const noon = new Date(`${dateStr}T12:00:00.000Z`);
  const nyHourAtNoon = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).formatToParts(noon).find((p) => p.type === "hour")!.value
  );
  // offset = how many hours NY is behind UTC (e.g. -4 for EDT, -5 for EST)
  const offsetHours = nyHourAtNoon - 12;
  const utcHour = hour - offsetHours;
  return new Date(`${dateStr}T${String(utcHour).padStart(2, "0")}:00:00.000Z`);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }

  const year  = parseInt(event.queryStringParameters?.year  ?? String(new Date().getFullYear()));
  const month = parseInt(event.queryStringParameters?.month ?? String(new Date().getMonth() + 1));

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid year or month" }),
    };
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const timeMin = new Date(year, month - 1, 1).toISOString();
    const timeMax = new Date(year, month, 0, 23, 59, 59).toISOString();

    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: TIMEZONE,
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busy = freeBusy.data.calendars?.[CALENDAR_ID]?.busy ?? [];
    const now  = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();

    const availability: Record<string, string[]> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const slots: string[] = [];

      for (let hour = DAY_START; hour <= DAY_END; hour++) {
        const slotStart = slotToUTC(dateStr, hour);
        const slotEnd   = new Date(slotStart.getTime() + SLOT_MINS * 60 * 1000);

        if (slotStart <= now) continue; // skip past slots

        const isBusy = busy.some((b) => {
          const bStart = new Date(b.start!);
          const bEnd   = new Date(b.end!);
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

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify(availability),
    };
  } catch (err) {
    console.error("get-availability error:", err);
    return {
      statusCode: 500,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch availability" }),
    };
  }
};
