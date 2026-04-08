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

  let passphrase: string;

  try {
    const body = await request.json() as { passphrase?: string };
    if (!body.passphrase || typeof body.passphrase !== "string") {
      throw new Error("Missing passphrase");
    }
    passphrase = body.passphrase.trim();
  } catch {
    return new Response(JSON.stringify({ error: "Missing or invalid request body" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const adminPassphrase = env.ADMIN_PASSPHRASE;

  if (!adminPassphrase) {
    console.error("ADMIN_PASSPHRASE env var is not set");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const isValid = passphrase === adminPassphrase;

  // Always return 200 — don't leak whether the passphrase env var exists
  // Just return valid: true/false
  return new Response(JSON.stringify({ valid: isValid }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
