import axios from "axios";

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


  } catch (error: any) {
    console.error("Error fetching current user:", error.response?.data || error.message);
    throw new Error("No se pudo obtener la información del usuario.");
  }
};
