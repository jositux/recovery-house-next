import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH, DIRECTUS_URL } from "@/lib/directus";

const isProd = process.env.NODE_ENV === "production";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE_REFRESH)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No hay sesión para refrescar" }, { status: 401 });
  }

  const refreshRes = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
  });

  const refreshData = await refreshRes.json();

  if (!refreshRes.ok) {
    const response = NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
    response.cookies.delete(AUTH_COOKIE_ACCESS);
    response.cookies.delete(AUTH_COOKIE_REFRESH);
    return response;
  }

  const { access_token, refresh_token, expires } = refreshData.data;

  const response = NextResponse.json({ expires });

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
