import axios from "axios";

/**
 * Limpia el localStorage y las cookies relacionadas con la sesión
 */
const clearSessionData = (): void => {
  // Limpia el localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires");
  localStorage.removeItem("nombre");
  localStorage.removeItem("initialRole");
  localStorage.removeItem("properties");
  
  // Clear cookies
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "nombre=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"));
};

/**
 * Realiza el logout: /api/auth/logout invalida el refresh_token real (en cookie
 * httpOnly) contra Directus y limpia esas cookies del lado del servidor.
 * El parámetro se mantiene por compatibilidad con los llamadores existentes pero
 * ya no se usa (el token real nunca está disponible en el cliente).
 */
export const logoutUser = async (_refreshToken?: string): Promise<void> => {
  try {
    await axios.post("/api/auth/logout");
  } catch (error) {
    console.error("Error al realizar el logout:", error);
    throw error; // Propaga el error para manejarlo en el componente
  } finally {
    clearSessionData();
  }
};
