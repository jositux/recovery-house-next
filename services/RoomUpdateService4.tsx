import axios from "axios";

const API_URL = "/webapi/items/Room";

export interface RoomUpdateData {
  id: string; // Se agrega el ID para identificar la habitación a actualizar
  propertyId: string;
  name: string;
  roomNumber: string;
  description: string;
  // Campos de tipo de habitación
  isPrivate: boolean;
  // Configuración de camas
  singleBeds: number;
  doubleBeds: number;
  // Total de camas y capacidad
  beds: number;
  capacity: number;
  // Precios para habitación o cama
  privateRoomPrice: number;
  privateRoomCleaning: number;

  // Pricing for SHARED room - 2 campos separados
  sharedRoomPrice: number;
  sharedRoomCleaning: number;

  bedType: string;
  bedName: string;

  // Estos campos antiguos ya no se envían
  checkinTime?: string;
  checkoutTime?: string;
  shortStayDiscount?: string;
  mediumStayDiscount?: string;
  longStayDiscount?: string;

  // Otros campos
  photos: string[];
  extraTags: string[];
  servicesTags: string[];
  descriptionService: string;
}

export const roomUpdateService = {
  async updateRoom(data: RoomUpdateData): Promise<{ id: string }> {
    // Verifica si el código se ejecuta en el cliente
    if (typeof window !== "undefined") {
      console.log();
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Token de acceso no encontrado");
      }

      // Normalizar `pricePerNight` y `cleaningFee`
      const normalizedPrivateRoomPrice =
        String(data.privateRoomPrice).trim() === ""
          ? "0"
          : String(data.privateRoomPrice);
      const normalizedPrivateRoomCleaning =
        String(data.privateRoomCleaning).trim() === ""
          ? "0"
          : String(data.privateRoomCleaning);
      const normalizedSharedRoomPrice =
        String(data.sharedRoomPrice).trim() === ""
          ? "0"
          : String(data.sharedRoomPrice);
      const normalizedSharedRoomCleaning =
        String(data.sharedRoomCleaning).trim() === ""
          ? "0"
          : String(data.sharedRoomCleaning);

      // Transformar servicesTags a [{ serviceTags_id: string }]
      const formattedServiceTags = data.servicesTags
        .filter((tag) => tag.trim() !== "") // Filtra valores vacíos o con solo espacios
        .map((tag) => ({ serviceTags_id: tag }));

      // Transformar extraTags a [{ extratags_id: string }]
      const formattedExtraTags = data.extraTags
        .filter((tag) => tag.trim() !== "") // Filtra valores vacíos o con solo espacios
        .map((tag) => ({ ExtraTags_id: tag }));

      // Transformar photos, asignando mainImage si photos está vacío
      const formattedPhotos = data.photos.map((photo) => ({
        directus_files_id: photo,
      }));

      // Transformar propertyId de string a { id: string }
      const formattedPropertyId = { id: data.propertyId };

      // Normalizar `pricePerNight` y `cleaningFee`

      console.log("ID EN SERVICE", data);

      // Función para convertir "HH:mm" a "HH:mm:00.000Z"
      const parseTimeToFullISOString = (timeStr?: string) => {
        if (!timeStr) return "00:00:00.000Z";
        const [hourStr, minuteStr] = timeStr.split(":");
        const hour = parseInt(hourStr) || 0;
        const minute = parseInt(minuteStr) || 0;
        return `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}:00.000Z`;
      };

      // Excluir campos antiguos
      const {
        id,
        checkinTime,
        checkoutTime,
        shortStayDiscount,
        mediumStayDiscount,
        longStayDiscount,
        ...rest
      } = data;

      // Crear una copia de data con servicesTags, extraTags, photos, y propertyId transformados
      const transformedData = {
        ...rest,
        privateRoomPrice: normalizedPrivateRoomPrice,
        privateRoomCleaning: normalizedPrivateRoomCleaning,
        sharedRoomPrice: normalizedSharedRoomPrice,
        sharedRoomCleaning: normalizedSharedRoomCleaning,
        servicesTags: formattedServiceTags,
        extraTags: formattedExtraTags,
        photos: formattedPhotos,
        propertyId: formattedPropertyId,

        // Campos nuevos que sí se envían
      discount_percentage_short_stay: parseInt(shortStayDiscount || "0"),
      discount_percentage_medium_stay: parseInt(mediumStayDiscount || "0"),
      discount_percentage_long_stay: parseInt(longStayDiscount || "0"),
      prepayment_percentage: 10,
      check_in_hour: parseTimeToFullISOString(checkinTime),
      check_out_hour: parseTimeToFullISOString(checkoutTime),

      };

      const response = await axios.patch(
        `${API_URL}/${data.id}`,
        transformedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Se espera que el endpoint retorne `{ id: string }`
    } else {
      throw new Error("localStorage no está disponible en el servidor");
    }
  },
};
