import axios from 'axios';

const API_URL = '/webapi/users';

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  birthDate: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  email: string;
  password: string;
  initialRole: "Patient" | "PropertyOwner" | "ServiceProvider";
  verification_url: string
}

export interface RegisterResponse {
  challenge: string;
  // Add any other fields that the API returns on successful registration
}

export const registerService = {
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    try {
      // Filtramos eliminando initialRole
      const { initialRole, birthDate, phone, emergencyPhone, address, ...filteredData } = credentials;
      const response = await axios.post<RegisterResponse>(`${API_URL}/registro`, filteredData);
      console.log(response.data)
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        if (error.response?.status === 409) {
          throw new Error('El email ya está registrado');
        }
        throw new Error(error.response?.data?.message || 'Ocurrió un error durante el registro');
      }
      // Handle other errors
      throw new Error('Ocurrió un error inesperado');
    }
  },
};

