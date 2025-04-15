import axios from 'axios';

// Directus endpoint for updating the current user
const API_URL = '/webapi/users/me'; 

// Interface remains the same for collecting form data
export interface ComplementaryRegisterCredentials {
  first_name: string;
  last_name: string;
  birthDate: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  initialRole: "Patient" | "PropertyOwner" | "ServiceProvider";
  // verification_url might not be needed here if it's handled differently for complementary registration
  // verification_url: string 
}

export interface RegisterResponse {
  challenge: string; // Assuming challenge might still be relevant? Adjust if needed.
  code: string;
  // Add any other fields that the API returns on successful registration
}

// Updated service to handle user update via Directus
export const complementaryRegisterService = {
  // Added access_token parameter
  updateUser: async (credentials: ComplementaryRegisterCredentials, access_token: string): Promise<any> => { // Return type might need adjustment based on Directus response
    if (!access_token) {
      throw new Error('Access token is required for updating user data.');
    }
    
    try {
      // Destructure credentials
      const { initialRole, birthDate, phone, emergencyPhone, address, first_name, last_name } = credentials;
      
      // Prepare data for Directus PATCH request
      // Assuming Directus fields match these names. Adjust if needed.
      // 'initialRole' and 'emergencyPhone' might be custom fields.
      const apiData = {
        first_name,
        last_name,
        // Assuming 'birthDate' field exists in Directus user collection
        birthDate, 
        phone,
        // Assuming 'emergencyPhone' is a custom field in Directus
        emergencyPhone, 
        address,
        // Assuming 'initialRole' is a custom field or role mapping is needed
        initialRole, 
      };

      // Make PATCH request to Directus /users/me endpoint
      const response = await axios.patch<any>( // Changed to PATCH, updated response type
        `${API_URL}`, 
        apiData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`, // Add Authorization header
          },
        }
      );
      
      // Return the updated user data from Directus response
      return response.data.data; // Directus typically wraps data in a 'data' object
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios errors, potentially specific Directus errors
        console.error("Directus API Error:", error.response?.data);
        const errorMessage = error.response?.data?.errors?.[0]?.message || 'Ocurrió un error al actualizar los datos del usuario';
        throw new Error(errorMessage);
      }
      // Handle other errors
      console.error("Unexpected Error:", error);
      throw new Error('Ocurrió un error inesperado al actualizar los datos');
    }
  },
};
