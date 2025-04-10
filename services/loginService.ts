import axios from 'axios';

const API_URL = '/webapi/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
data: {
    expires: string;
    refresh_token: string;
    access_token: string;
  }
  // Add any other fields that the API returns
}

export const loginService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, { ...credentials, mode: 'json' });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        throw new Error(error.response?.data?.message || 'An error occurred during login');
      }
      // Handle other errors
      throw new Error('An unexpected error occurred');
    }
  },
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/refresh`, 
        { refresh_token: refreshToken, mode: 'json' }
      );
      
      // Update localStorage with new tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem("expires", response.data.data.expires);
        localStorage.setItem("refresh_token", response.data.data.refresh_token);
        localStorage.setItem("access_token", response.data.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        throw new Error(error.response?.data?.message || 'Error refreshing token');
      }
      // Handle other errors
      throw new Error('An unexpected error occurred while refreshing token');
    }
  },
};

