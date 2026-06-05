import { cookies } from "next/headers";
import { authenticateAny, signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  const session = authenticateAny(email, password);
  if (!session) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return Response.json(session);
}
