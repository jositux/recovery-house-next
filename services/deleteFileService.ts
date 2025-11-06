// services/deleteFileService.ts
import axios from "axios";

const BASE_URL = "/webapi/files";

/**
 * Elimina un archivo de Directus por ID.
 * @param fileId - ID del archivo en Directus
 * @param accessToken - Token de acceso válido
 * @returns true si la eliminación fue exitosa
 */
export const deleteFile = async (fileId: string, accessToken: string): Promise<boolean> => {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  if (!fileId) {
    throw new Error("File ID is required");
  }

  const response = await axios.delete(`${BASE_URL}/${fileId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.status === 204; // Directus devuelve 204 No Content si fue exitoso
};
