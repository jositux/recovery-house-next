import axios from 'axios';

//const API_URL = '/webapi/users/register';

const API_URL = '/webapi/flows/trigger/c620e196-b720-44d5-8c71-5408e9a9f234'


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
  code: string;
  // Add any other fields that the API returns on successful registration
}

export const simpleRegisterService = {
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    try {
      const { initialRole, birthDate, phone, emergencyPhone, address, ...filteredData } = credentials;
      
      const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filteredData),
      });

      const data = await response.json();      

      if (!response.ok) {
          console.error(data);
          throw new Error(data.message);
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        throw new Error(error.response?.data?.message || 'Ocurrió un error durante el registro (Axios)');
      } else if (error instanceof Error) {
        // Handle standard Error objects (like the one thrown from fetch response check)
        throw new Error(error.message || 'Ocurrió un error inesperado durante el registro');
      } else {
        // Handle cases where the error is not an Error instance
        console.error('Unknown error type:', error);
        throw new Error('Ocurrió un error desconocido durante el registro');
      }
    }
  },
};

export const registerService = {
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    try {
      // Chequeamos que exista el email
      const { initialRole, birthDate, phone, emergencyPhone, address, ...filteredData } = credentials;
      const response = await axios.post<RegisterResponse>(`${API_URL}`, filteredData);
      
      if(response.data.code == "200") {
        await axios.post<RegisterResponse>(`/webapi/users/register`, filteredData);
      }
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

