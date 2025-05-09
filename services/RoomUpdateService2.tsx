import axios from "axios";

const API_URL = "/webapi/items/Room";

export interface RoomUpdateData {
  id: string; // Se agrega el ID para identificar la habitación a actualizar
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
  // Precios para habitación privada
  pricePerNight: number
  cleaningFee: number
  // Precios para habitación compartida
  singleBedPrice: number
  singleBedCleaningPrice: number
  doubleBedPrice: number
  doubleBedCleaningPrice: number
  // Otros campos
  photos: string[]
  extraTags: string[]
  servicesTags: string[]
  descriptionService: string
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
         

      // Transformar propertyId de string a { id: string }
      const formattedPropertyId = { id: data.propertyId };

      // Normalizar `pricePerNight` y `cleaningFee`

      console.log("ID EN SERVICE", data);

  
      // Crear una copia de data con servicesTags, extraTags, photos, y propertyId transformados
      const transformedData = {
        ...data,
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
