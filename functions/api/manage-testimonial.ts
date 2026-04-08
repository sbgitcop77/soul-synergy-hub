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
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let id: string;
  let action: string;
  let passphrase: string;

  try {
    const body = await request.json() as {
      id?: string;
      action?: string;
      passphrase?: string;
    };

    if (!body.id || !body.action || !body.passphrase) {
      throw new Error("Missing fields");
    }

    id = String(body.id).trim();
    action = body.action.trim();
    passphrase = body.passphrase.trim();

    if (!["approve", "reject"].includes(action)) {
      throw new Error("Invalid action");
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request body";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Verify passphrase server-side on every action
  const adminPassphrase = env.ADMIN_PASSPHRASE;
  if (!adminPassphrase || passphrase !== adminPassphrase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const sql = neon(cleanNeonUrl(env.NEON_DATABASE_URL));

  try {
    if (action === "approve") {
      await sql`
        UPDATE testimonials
        SET status = 'approved', is_published = true
        WHERE id = ${id}
      `;
    } else {
      // reject — keep the record but mark as rejected
      await sql`
        UPDATE testimonials
        SET status = 'rejected', is_published = false
        WHERE id = ${id}
      `;
    }

    return new Response(JSON.stringify({ success: true, id, action }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("manage-testimonial error:", message);
    return new Response(JSON.stringify({ error: "Failed to update testimonial", detail: message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
}
