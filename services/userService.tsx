import axios from "axios";
import { loginService } from "./loginService";

// Tipo para el usuario
export interface User {
  id: string;
  [key: string]: any; // Otros campos dinámicos si son necesarios
}

// Servicio para obtener la información del usuario actual
export const getCurrentUser = async (token: string): Promise<User> => {
  if (!token) {
    throw new Error("Token no proporcionado. Inicia sesión nuevamente.");
  }

  try {
    const response = await axios.get<{ data: User }>("/webapi/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;

  } catch (error: unknown) {
    // Check if the error is due to an expired token (401 Unauthorized)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        // Get refresh token from localStorage
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refresh_token") : null;
        
        if (!refreshToken) {
          throw new Error("No refresh token available. Please login again.");
        }
        
        // Attempt to refresh the token
        const refreshResponse = await loginService.refreshToken(refreshToken);
        
        // Retry the original request with the new token
        const newResponse = await axios.get<{ data: User }>("/webapi/users/me", {
          headers: {
            Authorization: `Bearer ${refreshResponse.data.access_token}`,
          },
        });
        
        return newResponse.data.data;
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError instanceof Error ? refreshError.message : 'Unknown error');
        // Clear localStorage on refresh failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem("expires");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("nombre");
        }
        
        throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.");
      }
    }
    
    // Handle other errors
    console.error("Error fetching current user:", 
      axios.isAxiosError(error) ? error.response?.data || error.message : 'Unknown error');
    throw new Error("No se pudo obtener la información del usuario.");
  }
};
