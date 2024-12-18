import axios from 'axios';

const API_URL = 'api/property';

export interface PhotoId {
  id: string;
}

export interface Photo {
  id: PhotoId;
}

export interface TaxIdEINFile {
  id: PhotoId;
}

export interface PropertyData {
  "name": string;
  "country": string;
  "region": string;
  "state": string;
  "city": string;
  "postalCode": string;
  "street": string;
  "number": string;
  "fullAddress": string;
  "latitude": number;
  "longitude": number;
  "type": string;
  "taxIdEIN": number;
  "photos": Array<{
      "id": string;
  }>;
  "taxIdEINFile": {
      "id": string;
  } | null;
}



export interface PropertyResponse {
  // Define the response structure here
  // This will depend on what the API returns after a successful property creation
  id: string;
  // ... other fields
}


export const propertyService = {
  createProperty: async (propertyData: PropertyData): Promise<PropertyResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post<PropertyResponse>(`${API_URL}`, propertyData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.setItem('propertyId', response.data.id);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        throw new Error(error.response?.data?.message || 'An error occurred while creating the property');
      }
      // Handle other errors
      throw new Error('An unexpected error occurred');
    }
  },
  updateProperty: async (propertyId: string, propertyData: Partial<PropertyData>): Promise<PropertyResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.patch<PropertyResponse>(`${API_URL}/${propertyId}`, propertyData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.setItem('propertyId', response.data.id);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'An error occurred while updating the property');
      }
      throw new Error('An unexpected error occurred');
    }
  },
};



