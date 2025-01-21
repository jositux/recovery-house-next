import axios from 'axios';

const API_URL = '/webapi/files'; 

interface FileUploadRequest {
  destination: string;
  title: string;
  description: string;
  file: File;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

interface FileUploadResponse {
  data: {
  id: string;
  filename_download: string;
}
}

export const fileService = {
  uploadFile: async (data: FileUploadRequest): Promise<FileUploadResponse> => {
    try {
      const token = localStorage.getItem('access_token');

      const formData = new FormData();
      /*formData.append('destination', data.destination);
      formData.append('title', data.title);
      formData.append('description', data.description);*/
      formData.append('file', data.file);

      const response = await axios.post<FileUploadResponse>(`${API_URL}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (data.onProgress && progressEvent.total !== undefined) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            data.onProgress(percentCompleted);
          }
        },
        signal: data.signal,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'An error occurred during file upload');
      }
      throw new Error('An unexpected error occurred during file upload');
    }
  },
};



