import { neon } from "@neondatabase/serverless";

function cleanNeonUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return raw;
  }
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function onRequest(context: {
  request: Request;
  env: Record<string, string>;
}) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers: cors });
  }

  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "approved";

  // Only allow valid status values
  if (!["approved", "pending", "rejected"].includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status parameter" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const sql = neon(cleanNeonUrl(env.NEON_DATABASE_URL));

  try {
    const testimonials = await sql`
      SELECT
        t.id,
        t.rating,
        t.body AS message,
        t.status,
        t.submitted_at AS created_at,
        COALESCE(c.first_name || ' ' || c.last_name, c.first_name, 'Anonymous') AS name,
        c.email
      FROM testimonials t
      LEFT JOIN contacts c ON c.id = t.contact_id
      WHERE t.status = ${status}
      ORDER BY t.submitted_at DESC
    `;

    return new Response(JSON.stringify({ testimonials }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("get-testimonials error:", message);
    return new Response(JSON.stringify({ error: "Failed to fetch testimonials", detail: message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
}
