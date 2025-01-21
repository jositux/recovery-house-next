import axios from 'axios';

const API_URL = '/webapi/users';

export interface UpdateUserCredentials {
  id: string;
  first_name: string;
  last_name: string;
  birthDate: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  email: string;
  password: string; 
}

export interface UpdateUserResponse {
  id: string;
  first_name: string;
  last_name: string;
  birthDate: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  email: string;
}

export const updateService = {
  updateUser: async (id: string, userData: UpdateUserCredentials): Promise<UpdateUserResponse> => {
    try {
      // Hacemos la solicitud PATCH a la API, incluyendo el id en la URL
      const response = await axios.patch<UpdateUserResponse>(`${API_URL}/${id}`, userData);

      console.log(response.data);  // Si necesitas depurar la respuesta
      return response.data;  // Devuelves los datos de usuario actualizados
    } catch (error) {
      // Manejamos el error si ocurre una excepción con Axios
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Manejo de errores basado en el código de estado HTTP
          switch (error.response.status) {
            case 409:
              throw new Error('El email ya está registrado');
            case 400:
              throw new Error('Datos inválidos, revisa los campos');
            case 500:
              throw new Error('Error interno del servidor');
            default:
              throw new Error(error.response.data?.message || 'Ocurrió un error durante la actualización');
          }
        } else if (error.request) {
          // Si no se recibió respuesta del servidor
          throw new Error('No se recibió respuesta del servidor');
        } else {
          // Otro tipo de error (por ejemplo, configuración de la solicitud fallida)
          throw new Error('Error en la configuración de la solicitud');
        }
      }
      // Manejo de errores no relacionados con Axios
      throw new Error('Ocurrió un error inesperado');
    }
  },
};
