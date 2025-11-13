/**
 * Sincroniza los tokens de autenticación de localStorage a las cookies
 * Esta función debe llamarse ANTES de navegar a rutas protegidas
 * para asegurar que el middleware tenga acceso a las cookies actualizadas
 */
export function syncAuthCookies(): void {
  if (typeof window === "undefined") return

  const accessToken = localStorage.getItem("access_token")
  const refreshToken = localStorage.getItem("refresh_token")
  const expires = localStorage.getItem("expires")

  if (accessToken && refreshToken) {
    // Calcular tiempo de expiración (7 días para access_token, 30 días para refresh_token)
    const accessTokenMaxAge = 60 * 60 * 24 * 7 // 7 días
    const refreshTokenMaxAge = 60 * 60 * 24 * 30 // 30 días

    // Actualizar cookies con SameSite=Lax para compatibilidad con navegación
    document.cookie = `access_token=${accessToken}; path=/; max-age=${accessTokenMaxAge}; SameSite=Lax`
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${refreshTokenMaxAge}; SameSite=Lax`

    if (expires) {
      document.cookie = `expires=${expires}; path=/; max-age=${accessTokenMaxAge}; SameSite=Lax`
    }

    // También sincronizar el nombre si existe
    const nombre = localStorage.getItem("nombre")
    if (nombre) {
      document.cookie = `nombre=${encodeURIComponent(nombre)}; path=/; max-age=${accessTokenMaxAge}; SameSite=Lax`
    }

    console.debug("[syncAuthCookies] Cookies sincronizadas exitosamente")
  } else {
    console.debug("[syncAuthCookies] No se encontraron tokens en localStorage")
  }
}
