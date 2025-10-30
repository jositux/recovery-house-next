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
  privateRoomPrice: number
  privateRoomCleaning: number
  // Pricing for SHARED room
  sharedRoomPrice: number
  sharedRoomCleaning: number
  bedType: string
  bedName: string
  // Estos campos antiguos ya no se envían
  checkinTime?: string
  checkoutTime?: string
  shortStayDiscount?: string
  mediumStayDiscount?: string
  longStayDiscount?: string
  imageFiles?: File[]
  // Otros campos
  photos: string[]
  extraTags: string[]
  servicesTags: string[]
  descriptionService: string
}

export const roomService = {
  async createRoom(data: RoomData & { prepayment_percentage?: string }): Promise<{ id: string }> {
    if (typeof window === "undefined") {
      throw new Error('localStorage no está disponible en el servidor');
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token de acceso no encontrado');
    }

    // Normalizar precios y limpieza
    const normalizedPrivateRoomPrice = String(data.privateRoomPrice || 0);
    const normalizedPrivateRoomCleaning = String(data.privateRoomCleaning || 0);
    const normalizedSharedRoomPrice = String(data.sharedRoomPrice || 0);
    const normalizedSharedRoomCleaning = String(data.sharedRoomCleaning || 0);

    // Transformar arrays
    const formattedServiceTags = data.servicesTags.map(tag => ({ serviceTags_id: tag }));
    const formattedExtraTags = data.extraTags.map(tag => ({ ExtraTags_id: tag }));
    const formattedPhotos = data.photos.map(photo => ({ directus_files_id: photo }));

    // Función para convertir "HH:mm" a "HH:mm:00.000Z"
    const parseTimeToFullISOString = (timeStr?: string) => {
      if (!timeStr) return "00:00:00.000Z";
      const [hourStr, minuteStr] = timeStr.split(":");
      const hour = parseInt(hourStr) || 0;
      const minute = parseInt(minuteStr) || 0;
      return `${hour.toString().padStart(2,"0")}:${minute.toString().padStart(2,"0")}:00.000Z`;
    };

    // Excluir campos antiguos
    const {
      id,
      checkinTime,
      checkoutTime,
      shortStayDiscount,
      mediumStayDiscount,
      longStayDiscount,
      imageFiles,
      ...rest
    } = data;

    // Construir objeto final para enviar
    const transformedData = {
      ...rest,
      privateRoomPrice: normalizedPrivateRoomPrice,
      privateRoomCleaning: normalizedPrivateRoomCleaning,
      sharedRoomPrice: normalizedSharedRoomPrice,
      sharedRoomCleaning: normalizedSharedRoomCleaning,
      servicesTags: formattedServiceTags,
      extraTags: formattedExtraTags,
      photos: formattedPhotos,

      // Campos nuevos que sí se envían
      discount_percentage_short_stay: parseInt(shortStayDiscount || "0"),
      discount_percentage_medium_stay: parseInt(mediumStayDiscount || "0"),
      discount_percentage_long_stay: parseInt(longStayDiscount || "0"),
      prepayment_percentage: parseInt(data.prepayment_percentage || "10"),
      check_in_hour: parseTimeToFullISOString(checkinTime),
      check_out_hour: parseTimeToFullISOString(checkoutTime),
    };

    console.log("transformedData:", transformedData);

    const response = await axios.post(API_URL, transformedData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  },
};
