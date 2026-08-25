import axios from 'axios';
import type { User } from './userService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  expires: string;
}

export const loginService = {
  // El login corre en /api/auth/login (server-side): los tokens de Directus
  // nunca llegan al browser, se guardan como cookies httpOnly.
  login: async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const response = await axios.post<LoginResult>('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'An error occurred during login');
      }
      throw new Error('An unexpected error occurred');
    }
  },
  // Refresca la sesión leyendo la cookie httpOnly del lado del servidor; no necesita
  // (ni recibe) el refresh_token real desde el cliente.
  refreshToken: async (): Promise<{ expires: string }> => {
    try {
      const response = await axios.post<{ expires: string }>('/api/auth/refresh');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error refreshing token');
      }
      throw new Error('An unexpected error occurred while refreshing token');
    }
  },
};
