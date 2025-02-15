import axios from 'axios';

const API_URL = '/webapi/items/Property';

export interface PropertyData {
  "name": string;
  "description": string;
  "country": string;
  "state": string;
  "city": string;
  "postalCode": string;
  "address": string;
  "fullAddress": string;
  "latitude": number;
  "longitude": number;
  "type": string;
  "taxIdEIN": string;
  "mainImage": string;
  "RNTFile": string;
  "taxIdEINFile": string;
  "hostName": string,
  "guestComments": string,
  "patology": string[]
}

export interface PropertyResponse {
  // Define the response structure here
  // This will depend on what the API returns after a successful property creation
  data: {
  id: string;
}
  // ... other fields
}

export const propertyService = {
  createProperty: async (propertyData: PropertyData): Promise<PropertyResponse> => {
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
        region: "",
        state: propertyData.state,
        city: propertyData.city,
        postalCode: propertyData.postalCode,
        address: propertyData.address,
        fullAddress: propertyData.fullAddress,
        "place": {
            "type": "Point",
            "coordinates": [
               propertyData?.latitude || 4.7110,
               propertyData?.longitude || 74.0721
            ]
        },
        type: propertyData.type,
        taxIdEIN: propertyData.taxIdEIN,
        RNTFile: propertyData.RNTFile,
        taxIdEINFile: propertyData.taxIdEINFile,
        taxIdApproved: false,
        mainImage: propertyData.mainImage,
        hostName: propertyData.hostName,
        guestComments: propertyData.guestComments,
        patology: JSON.stringify(propertyData.patology),
        photos: [],
        Rooms: []
    }

      const response = await axios.post<PropertyResponse>(`${API_URL}`, formatedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.setItem('propertyId', response.data.data.id);

      console.log('API Response:', response.data.data.id);


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
};
