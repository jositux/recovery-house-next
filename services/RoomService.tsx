import axios from "axios";

const API_URL = "/webapi/items/Room";

export interface RoomData {
  id: string;
  name: string;
  roomNumber: string;
  beds: number;
  capacity: number;
  description: string;
  pricePerNight: string;
  propertyId: string;
  cleaningFee: string;
  photos: string[];
  extraTags: string[]; // Recibido como array de strings
  servicesTags: string[]; // Recibido como array de strings
  descriptionService: string;
}

export const roomService = {
  async createRoom(data: RoomData): Promise<{ id: string }> {
    // Verifica si el código se ejecuta en el cliente
    if (typeof window !== "undefined") {
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
      const formattedServiceTags = data.servicesTags
      .filter(tag => tag.trim() !== "") // Filtra valores vacíos o con solo espacios
      .map(tag => ({ serviceTags_id: tag }));

      // Transformar extraTags a [{ extratags_id: string }]
      const formattedExtraTags = data.extraTags
        .filter((tag) => tag.trim() !== "") // Filtra valores vacíos o con solo espacios
        .map((tag) => ({ ExtraTags_id: tag }));

      // Transformar photos, asignando mainImage si photos está vacío
      const formattedPhotos =
data.photos.map((photo) => ({
              directus_files_id: photo,
            }))
         

      // Crear una copia de data con los campos transformados
      //const { id, ...resData } = data; // Excluir id
      const transformedData = {
        //...resData,
        pricePerNight: normalizedPricePerNight,
        cleaningFee: normalizedCleaningFee,
        servicesTags: formattedServiceTags,
        extraTags: formattedExtraTags,
        photos: formattedPhotos,
      };

      console.log("transformed: ", transformedData);

      const response = await axios.post(API_URL, transformedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data; // Se espera que el endpoint retorne `{ id: string }`
    } else {
      throw new Error("localStorage no está disponible en el servidor");
    }
  },
};
