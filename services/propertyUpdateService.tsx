import axios from 'axios';

const API_URL = '/webapi/items/Property';

export interface PropertyData {
  name: string;
  description: string;
  country: string;
  region: string;
  state: string;
  city: string;
  postalCode: string;
  street: string;
  number: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  type: string;
  taxIdEIN: string;
  mainImage: string;
  RNTFile: string;
  taxIdEINFile: string;
  Rooms: string[];
}

export interface PropertyResponse {
  data: {
    id: string;
  };
}

export const propertyUpdateService = {
  updateProperty: async (
    propertyId: string, 
    propertyData: PropertyData
  ): Promise<PropertyResponse> => {
    try {
      const token = localStorage.getItem('access_token');

      const responseUser = await axios.get("/webapi/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const patient_id = responseUser.data.data.id;

      const formatedData = {
        userId: patient_id,
        name: propertyData.name,
        description: propertyData.description,
        country: propertyData.country,
        region: propertyData.region,
        state: propertyData.state,
        city: propertyData.city,
        postalCode: propertyData.postalCode,
        street: propertyData.fullAddress,
        number: propertyData.number,
        place: {
          type: "Point",
          coordinates: [propertyData.latitude, propertyData.longitude],
        },
        type: propertyData.type,
        taxIdEIN: propertyData.taxIdEIN,
        RNTFile: propertyData.RNTFile,
        taxIdEINFile: propertyData.taxIdEINFile,
        taxIdApproved: false,
        mainImage: propertyData.mainImage,
        Rooms: propertyData.Rooms,
      };

      const response = await axios.patch<PropertyResponse>(
        `${API_URL}/${propertyId}`, // Usar el ID de la propiedad en el endpoint
        formatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('API Response:', response.data.data.id);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
          'An error occurred while updating the property'
        );
      }
      throw new Error('An unexpected error occurred');
    }
  },
};
