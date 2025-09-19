// services/directusUserService.ts
import axios from "axios";

const API_BASE_URL = "/webapi";
// ⚠️ usa NEXT_PUBLIC_ si vas a llamar al service desde el cliente (browser)
// Si lo usás solo en server components / API routes, puede ser DIRECTUS_URL a secas

// 🔹 Definición de la interfaz
export interface User {
  id: string;
  first_name: string;
  last_name: string;
}

// 🔹 Función para traer usuario por ID
export async function fetchUserById(
  accessToken: string,
  userId: string
): Promise<User> {
  if (!userId) throw new Error("User ID is required");
  if (!accessToken) throw new Error("Access token is required");

  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = response.data.data;

    return {
      id: user.id as string,
      first_name: user.first_name as string,
      last_name: user.last_name as string,
    };
  } catch (error: any) {
    console.error(
      "Error fetching user from Directus:",
      error.response?.data || error.message
    );
    throw error;
  }
}