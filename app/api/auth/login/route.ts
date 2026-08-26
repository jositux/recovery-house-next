import { NextResponse } from "next/server";
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH, DIRECTUS_URL } from "@/lib/directus";
import { checkRateLimit, formatRetryMessage, getClientIp } from "@/lib/rateLimit";

const isProd = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  // Freno básico contra intentos repetidos de credential stuffing (ver
  // lib/rateLimit.ts para las limitaciones de este enfoque en serverless).
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`, 10, 5 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: formatRetryMessage(rateLimit.retryAfterSeconds) },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 });
  }

  const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mode: "json" }),
  });

  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    return NextResponse.json(
      { message: loginData?.errors?.[0]?.message || "Credenciales inválidas" },
      { status: loginRes.status }
    );
  }

  const { access_token, refresh_token, expires } = loginData.data;

  const meRes = await fetch(`${DIRECTUS_URL}/users/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const meData = await meRes.json();

  if (!meRes.ok) {
    return NextResponse.json({ message: "No se pudo obtener el usuario" }, { status: 502 });
  }

  // Solo se expone lo que el cliente realmente usa (nombre para mostrar).
  // El objeto completo de Directus trae rol, políticas y otros campos internos
  // que no hace falta mandar al navegador.
  const response = NextResponse.json({
    user: {
      id: meData.data.id,
      first_name: meData.data.first_name,
      last_name: meData.data.last_name,
    },
    expires,
  });

  response.cookies.set(AUTH_COOKIE_ACCESS, access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(AUTH_COOKIE_REFRESH, refresh_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
