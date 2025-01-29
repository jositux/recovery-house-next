import axios from "axios";

const API_BASE_URL = "/webapi"; // Cambiar por la URL de tu instancia de Directus

/**
 * Realiza el logout en Directus utilizando el refresh token.
 * @param refreshToken - El token de acceso almacenado en localStorage.
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {
      refresh_token: refreshToken,
      mode: "json",
    });

    if (response.status === 200) {
      console.log("Logout exitoso");
    } else {
      console.warn("El logout no se completó correctamente:", response.statusText);
    }
  } catch (error) {
    console.error("Error al realizar el logout:", error);
    throw error; // Propaga el error para manejarlo en el componente
  }
};
