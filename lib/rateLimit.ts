// Rate limiting en memoria: freno básico contra reintentos automáticos desde
// un mismo script (login, registro, pedido de reset de contraseña).
//
// Limitación real, a tener en cuenta: en Vercel cada función serverless/edge
// puede correr en una instancia distinta, y esta cuenta vive solo en la
// memoria de ESA instancia — no se comparte entre todas. Un atacante que
// reparte sus intentos entre varias instancias (o espera a que haya un cold
// start) puede esquivarlo parcialmente. Para una protección real y
// compartida hace falta un store externo (ej. Upstash Redis). Esto es mejor
// que nada, no una solución definitiva.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

/**
 * @param key identificador (normalmente IP + nombre de la acción)
 * @param limit cantidad máxima de intentos permitidos en la ventana
 * @param windowMs duración de la ventana en milisegundos
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count++
  return { allowed: true, retryAfterSeconds: 0 }
}

export function formatRetryMessage(retryAfterSeconds: number): string {
  if (retryAfterSeconds <= 60) {
    return `Demasiados intentos. Probá de nuevo en ${retryAfterSeconds} segundo${retryAfterSeconds === 1 ? "" : "s"}.`
  }
  const minutes = Math.ceil(retryAfterSeconds / 60)
  return `Demasiados intentos. Probá de nuevo en ${minutes} minuto${minutes === 1 ? "" : "s"}.`
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}
