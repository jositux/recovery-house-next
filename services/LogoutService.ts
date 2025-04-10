import axios from "axios";

const API_BASE_URL = "/webapi";

/**
 * Realiza el logout en Directus utilizando el refresh token.
 * @param refreshToken - El token de refresco almacenado en localStorage.
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {
      refresh_token: refreshToken,
      mode: "json",
    });
    if (response.status === 204) {
      console.log("Logout exitoso");
      
      // Clear local tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("nombre");
      
      // Trigger storage event for components to update
      window.dispatchEvent(new Event("storage"));
    } else {
      console.warn("El logout no se completó correctamente:", response);
    }
  } catch (error) {
    console.error("Error al realizar el logout:", error);
    
    // Even if logout fails on the server, clear local tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("nombre");
    
    // Trigger storage event for components to update
    window.dispatchEvent(new Event("storage"));
    
    throw error; // Propaga el error para manejarlo en el componente
  }
};
