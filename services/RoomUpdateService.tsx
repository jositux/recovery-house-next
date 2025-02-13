import axios from "axios";

const API_URL = "/webapi/items/Room";

export interface RoomUpdateData {
  id: string; // Se agrega el ID para identificar la habitación a actualizar
  name: string;
  roomNumber: string;
  beds: number;
  capacity: number;
  description: string;
  pricePerNight: number;
  mainImage: string;
  propertyId: string;
  cleaningFee: number;
  photos: string[];
  extraTags: string[]; // Recibido como array de strings
  servicesTags: string[]; // Recibido como array de strings
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
      const normalizedPricePerNight =
        String(data.pricePerNight).trim() === ""
          ? "0"
          : String(data.pricePerNight);
      const normalizedCleaningFee =
        String(data.cleaningFee).trim() === "" ? "0" : String(data.cleaningFee);

      // Transformar servicesTags a [{ serviceTags_id: string }]
      const formattedServiceTags = data.servicesTags.map((tag) => ({
        serviceTags_id: tag,
      }));

      // Transformar extraTags a [{ extratags_id: string }]
      const formattedExtraTags = data.extraTags.map((tag) => ({
        ExtraTags_id: tag,
      }));

      // Transformar photos, asignando mainImage si photos está vacío
      const formattedPhotos =
        data.photos.length > 0
          ? data.photos.map((photo) => ({
              directus_files_id: photo,
            }))
          : [{ directus_files_id: data.mainImage }];

      // Transformar propertyId de string a { id: string }
      const formattedPropertyId = { id: data.propertyId };

      // Normalizar `pricePerNight` y `cleaningFee`

      console.log("ID EN SERVICE", data);

      // Crear una copia de data con servicesTags, extraTags, photos, y propertyId transformados
      const transformedData = {
        ...data,
        mainImage: formattedPhotos[0].directus_files_id,
        pricePerNight: normalizedPricePerNight,
        cleaningFee: normalizedCleaningFee,
        servicesTags: formattedServiceTags,
        extraTags: formattedExtraTags,
        photos: formattedPhotos,
        propertyId: formattedPropertyId,
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
