import axios from 'axios';

const API_URL = '/api/property';

export interface RoomData {
  name: string;
  number: string;
  beds: number;
  capacity: number;
  description: string;
  pricePerNigth: string;
  mainImage: {
    id: string;
  };
  photos: {
    id: string;
  }[];
  services: {
    key: string;
  }[];
  extraTags: {
    key: string;
  }[];
}

export interface RoomResponse {
  id: string;
  // Add other fields that the API returns after successful room creation
}

export const roomsService = {
  createRooms: async (propertyId: string, rooms: RoomData[]): Promise<RoomResponse[]> => {
    const token = localStorage.getItem('accessToken');

    const createdRooms: RoomResponse[] = [];

    for (const room of rooms) {
      try {
        const response = await axios.post<RoomResponse>(
          `${API_URL}/${propertyId}/room`,
          room,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        createdRooms.push(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error creating room:', error.response?.data?.message || error.message);
          throw new Error(error.response?.data?.message || 'An error occurred while creating the room');
        }
        throw new Error('An unexpected error occurred while creating the room');
      }
    }

    return createdRooms;
  },
};

