import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH, DIRECTUS_URL } from "@/lib/directus";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE_REFRESH)?.value;

  if (refreshToken) {
    try {
      await fetch(`${DIRECTUS_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
      });
    } catch {
      // Si Directus no responde, igual limpiamos las cookies locales.
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE_ACCESS);
  response.cookies.delete(AUTH_COOKIE_REFRESH);
  return response;
}
