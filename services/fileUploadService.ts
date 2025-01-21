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

  const response = await axios.post(BASE_URL, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};
