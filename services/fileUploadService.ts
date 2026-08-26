// services/fileUploadService.ts
import axios from 'axios';

const BASE_URL = '/webapi/files';

export const uploadFile = async (file: File): Promise<{ id: string; filename_download: string }> => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    throw new Error('Access token not found');
  }

  const formData = new FormData();
  formData.append('file', file);

  // No fijar Content-Type a mano: con FormData, el navegador tiene que
  // generarlo (incluye el "boundary" que separa las partes del archivo). Si lo
  // pisamos con un valor fijo sin boundary, el servidor no puede parsear el
  // archivo.
  const response = await axios.post(BASE_URL, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.data;
};

// Sube varios archivos con un límite de cuántos van en simultáneo, en vez de
// dispararlos todos juntos (varias fotos grandes al mismo tiempo pueden
// chocar con el límite de tamaño de request del middleware/proxy).
export const uploadFiles = async (
  files: File[],
  concurrency = 3,
): Promise<{ id: string; filename_download: string }[]> => {
  const results: { id: string; filename_download: string }[] = new Array(files.length);
  let cursor = 0;

  async function worker() {
    while (cursor < files.length) {
      const index = cursor++;
      results[index] = await uploadFile(files[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
  return results;
};
