import axios from "axios";

const API_BASE_URL = "/webapi";

/**
 * Limpia el localStorage y las cookies relacionadas con la sesión
 */
const clearSessionData = (): void => {
  // Limpia el localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires");
  localStorage.removeItem("nombre");
  
  // Clear cookies
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "nombre=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"));
};

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
      
      clearSessionData();

    } else {
      console.warn("El logout no se completó correctamente:", response);
    }
  } catch (error) {
    console.error("Error al realizar el logout:", error);
    
      clearSessionData();
    
    throw error; // Propaga el error para manejarlo en el componente
  }
};
