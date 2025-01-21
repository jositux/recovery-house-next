import axios from "axios";

const API_URL = '/webapi/items/Room';

export interface RoomData {
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

export const roomService = {
  async createRoom(data: RoomData): Promise<{ id: string }> {
    // Verifica si el código se ejecuta en el cliente
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token de acceso no encontrado');
      }

      // Normalizar `pricePerNight` y `cleaningFee`
      const normalizedPricePerNight = data.pricePerNight.trim() === "" ? "0" : data.pricePerNight;
      const normalizedCleaningFee = data.cleaningFee.trim() === "" ? "0" : data.cleaningFee;

      // Transformar servicesTags a [{ serviceTags_id: string }]
      const formattedServiceTags = data.servicesTags.map(tag => ({
        serviceTags_id: tag,
      }));

      // Transformar extraTags a [{ extratags_id: string }]
      const formattedExtraTags = data.extraTags.map(tag => ({
        ExtraTags_id: tag,
      }));

      // Transformar photos, asignando mainImage si photos está vacío
      const formattedPhotos =
        data.photos.length > 0
          ? data.photos.map(photo => ({
              directus_files_id: photo,
            }))
          : [{ directus_files_id: data.mainImage }];

      // Transformar propertyId de string a { id: string }
      const formattedPropertyId = { id: data.propertyId };

      // Crear una copia de data con los campos transformados
      const transformedData = {
        ...data,
        pricePerNight: normalizedPricePerNight,
        cleaningFee: normalizedCleaningFee,
        propertyId: formattedPropertyId,
        servicesTags: formattedServiceTags,
        extraTags: formattedExtraTags,
        photos: formattedPhotos,
      };

      const response = await axios.post(API_URL, transformedData, {
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
