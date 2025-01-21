import axios from "axios";

// Tipo para las propiedades
export interface Property {
  id: string;
  userId: string;
  name: string;
  country: string;
  [key: string]: any; // Otros campos dinámicos si es necesario
}

// Servicio para obtener las propiedades con un ID de usuario
export const getPropertiesByUserId = async (userId: string, token: string): Promise<Property[]> => {
  if (!userId) {
    throw new Error("Se requiere userId para obtener propiedades");
  }

  if (!token) {
    throw new Error("Se requiere un token para realizar la solicitud");
  }

  try {
    const response = await axios.get<{ data: Property[] }>("/webapi/items/Property", {
      headers: {
        Authorization: `Bearer ${token}`, // Incluye el token en la solicitud
      },
      params: {
        "filter[userId][_eq]": userId,
        'fields': '*,photos.directus_files_id.*,RNTFile.filename_download,RNTFile.id,taxIdEINFile.filename_download,taxIdEINFile.id,Rooms.*,Rooms.photos.directus_files_id.id,Rooms.extraTags.ExtraTags_id,Rooms.servicesTags.serviceTags_id'
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching properties:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener las propiedades");
  }
};
