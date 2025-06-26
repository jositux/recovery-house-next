import axios from "axios";

const API_URL = '/webapi/items/Room';

export interface RoomData {
  id: string
  propertyId: string
  name: string
  roomNumber: string
  description: string
  // Campos de tipo de habitación
  isPrivate: boolean
  // Configuración de camas
  singleBeds: number
  doubleBeds: number
  // Total de camas y capacidad
  beds: number
  capacity: number
  // Precios para habitación o cama
  privateRoomPrice: number,
  privateRoomCleaning: number,

  // Pricing for SHARED room - 2 campos separados
  sharedRoomPrice: number,
  sharedRoomCleaning: number,

  bedType: string,
  bedName: string,

  // Otros campos
  photos: string[]
  extraTags: string[]
  servicesTags: string[]
  descriptionService: string
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
      const normalizedPrivateRoomPrice = String(data.privateRoomPrice).trim() === "" ? "0" : String(data.privateRoomPrice);
      const normalizedPrivateRoomCleaning = String(data.privateRoomCleaning).trim() === "" ? "0" : String(data.privateRoomCleaning);
      const normalizedSharedRoomPrice = String(data.sharedRoomPrice).trim() === "" ? "0" : String(data.sharedRoomPrice);
      const normalizedSharedRoomCleaning = String(data.sharedRoomCleaning).trim() === "" ? "0" : String(data.sharedRoomCleaning);

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
data.photos.map(photo => ({
              directus_files_id: photo,
            }))


      // Crear una copia de data con los campos transformados
      const { id, ...resData } = data; // Excluir id
      const transformedData = {
        ...resData,
      privateRoomPrice : normalizedPrivateRoomPrice,
      privateRoomCleaning: normalizedPrivateRoomCleaning,
      sharedRoomPrice : normalizedSharedRoomPrice,
      sharedRoomCleaning: normalizedSharedRoomCleaning,

        servicesTags: formattedServiceTags,
        extraTags: formattedExtraTags,
        photos: formattedPhotos,
      };

      console.log("transformed: ", transformedData)

      const response = await axios.post(API_URL, transformedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data; // Se espera que el endpoint retorne `{ id: string }`
    } else {
      throw new Error('localStorage no está disponible en el servidor');
    }
  },
};
