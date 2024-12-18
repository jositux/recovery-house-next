import axios from 'axios';

const API_URL = '/api/users';

export interface VerificationCredentials {
  eMail: string;
  challenge: string;
  code: number;
}

export interface VerificationResponse {
  accessToken: string;
  // Add any other fields that the API returns on successful verification
}

export const verificationService = {
  verify: async (credentials: VerificationCredentials): Promise<VerificationResponse> => {
    try {
      const response = await axios.post<VerificationResponse>(`${API_URL}/verification`, {
        eMail: credentials.eMail,
        challenge: credentials.challenge,
        code: credentials.code
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        throw new Error(error.response?.data?.message || 'Ocurrió un error durante la verificación');
      }
      // Handle other errors
      throw new Error('Ocurrió un error inesperado');
    }
  },
};

