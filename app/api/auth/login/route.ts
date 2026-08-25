import { NextResponse } from "next/server";
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH, DIRECTUS_URL } from "@/lib/directus";

const isProd = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
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

  const response = NextResponse.json({ user: meData.data, expires });

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
