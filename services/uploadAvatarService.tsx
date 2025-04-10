import axios from "axios"

const DIRECTUS_URL = "/webapi"

// Función para subir imagen en Base64 a Directus
export const uploadBase64ToDirectus = async (
  base64String: string,
  accessToken: string // Se recibe el token de acceso
): Promise<string | null> => {
  if (!base64String || !accessToken) return null

  try {
    // Convertir Base64 a Blob
    const byteCharacters = atob(base64String.split(",")[1])
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "image/png" }) // Ajusta el tipo según el archivo

    // Crear un archivo desde el Blob
    const file = new File([blob], "avatar.png", { type: "image/png" })

    // Crear FormData
    const formData = new FormData()
    formData.append("file", file)

    // Enviar la imagen a Directus con Axios
    const response = await axios.post(`${DIRECTUS_URL}/files`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Se usa el token de acceso
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data.data?.id || null // Retorna el ID del archivo
  } catch (error) {
    console.error("Error al subir la imagen a Directus:", error)
    return null
  }
}
