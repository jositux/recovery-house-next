import axios from "axios";

const API_URL = '/webapi/items/Room';

export interface RoomUpdateData {
  id: string; // Se agrega el ID para identificar la habitación a actualizar
  name: string;
  roomNumber: string;
  beds: number;
  capacity: number;
  description: string;
  pricePerNight: string;
  mainImage: string;
  propertyId: string;
  cleaningFee: string;
  photos: string[];
  extraTags: string[]; // Recibido como array de strings
  servicesTags: string[]; // Recibido como array de strings
}

export const roomUpdateService = {
  async updateRoom(data: RoomUpdateData): Promise<{ id: string }> {
    // Verifica si el código se ejecuta en el cliente
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token de acceso no encontrado');
      }

      // Transformar servicesTags a [{ serviceTags_id: string }]
      const formattedServiceTags = data.servicesTags;

      // Transformar extraTags a [{ extratags_id: string }]
      const formattedExtraTags = data.extraTags;

      // Transformar photos, asignando mainImage si photos está vacío
      const formattedPhotos =
        data.photos.length > 0
          ? data.photos
          : [{ directus_files_id: data.mainImage }];

      // Transformar propertyId de string a { id: string }
      const formattedPropertyId = { id: data.propertyId };

      // Crear una copia de data con servicesTags, extraTags, photos, y propertyId transformados
      const transformedData = {
        ...data,
        propertyId: formattedPropertyId,
        servicesTags: formattedServiceTags,
        extraTags: formattedExtraTags,
        photos: formattedPhotos,
      };

      const response = await axios.patch(`${API_URL}/${data.id}`, transformedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Se espera que el endpoint retorne `{ id: string }`
    } else {
      throw new Error('localStorage no está disponible en el servidor');
    }
  },
};
