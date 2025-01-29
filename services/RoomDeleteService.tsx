import axios from "axios";

const API_URL = '/webapi/items/Room';

export const roomDeleteService = {
  async deleteRoom(id: string): Promise<{ message: string }> {
    // Verifica si el código se ejecuta en el cliente
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token de acceso no encontrado');
      }

      // Realiza la solicitud DELETE al endpoint con el ID
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data)
      return response.data; // Se espera que el endpoint retorne `{ message: string }` u otro objeto indicativo
    } else {
      throw new Error('localStorage no está disponible en el servidor');
    }
  },
};



