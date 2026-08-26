// Redimensiona y recomprime una imagen en el navegador antes de subirla, para
// no depender de que el usuario suba fotos de celular de 4-8MB tal cual (eso
// choca con el límite de tamaño de request del middleware/Vercel).
const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.8
// Guardrail: si el archivo original ya es absurdamente grande, ni intentamos
// decodificarlo en un canvas (podría trabar el navegador).
const MAX_ORIGINAL_SIZE_MB = 25

export async function compressImage(file: File): Promise<File> {
  if (file.size > MAX_ORIGINAL_SIZE_MB * 1024 * 1024) {
    throw new Error(`El archivo pesa demasiado (más de ${MAX_ORIGINAL_SIZE_MB}MB).`)
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image()
      image.onload = () => resolve(image)
      // Los navegadores que no soportan el formato (ej. HEIC en Chrome/Firefox)
      // fallan acá, con un mensaje claro en vez de un error genérico más tarde.
      image.onerror = () => reject(new Error("Formato de imagen no soportado. Probá convertirla a JPG o PNG."))
      image.src = objectUrl
    })

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No se pudo procesar la imagen.")
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY))
    if (!blob) throw new Error("No se pudo procesar la imagen.")

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg"
    return new File([blob], newName, { type: "image/jpeg" })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export interface CompressResult {
  original: File
  file?: File
  error?: string
}

// Corre la compresión sobre varios archivos, capando cuántas corren en
// simultáneo (decodificar muchas imágenes grandes a la vez puede colgar el
// navegador igual que muchos requests de red a la vez saturan el servidor).
// Si un archivo falla (ej. formato no soportado), no aborta a los demás.
export async function compressImages(files: File[], concurrency = 3): Promise<CompressResult[]> {
  const results: CompressResult[] = new Array(files.length)
  let cursor = 0

  async function worker() {
    while (cursor < files.length) {
      const index = cursor++
      const original = files[index]
      try {
        const file = await compressImage(original)
        results[index] = { original, file }
      } catch (error) {
        results[index] = { original, error: error instanceof Error ? error.message : String(error) }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker))
  return results
}
