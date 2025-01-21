import axios from "axios";

// Tipo para los proveedores
export interface Provider {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  description: string;
  membership: string;
  taxIdEIN: string;
  [key: string]: any; // Otros campos dinámicos si es necesario
}

// Servicio para obtener y transformar proveedores
export const getProvidersByUserId = async (
  userId: string,
  token: string
): Promise<Provider[]> => {
  if (!userId) {
    throw new Error("Se requiere userId para obtener proveedores");
  }

  if (!token) {
    throw new Error("Se requiere un token para realizar la solicitud");
  }

  try {
    const response = await axios.get<{ data: any[] }>("/webapi/items/Provider", {
      headers: {
        Authorization: `Bearer ${token}`, // Incluye el token en la solicitud
      },
      params: {
        "filter[userId][_eq]": userId,
        fields: "*,serviceTags.serviceTags_id,extraTags.ExtraTags_id,RNTFile.filename_download,RNTFile.id,taxIdEINFile.filename_download,taxIdEINFile.id",
      },
    });

    // Transformar los datos recibidos al formato deseado
    const transformedData: Provider[] = response.data.data.map((item) => ({
      id: item.id || "", // Agregar el id del servicio
      userId: item.userId || "", // Agregar el id del proveedor
      name: item.name || "", // Nombre del proveedor
      email: item.email || "", // Correo electrónico
      phone: item.phone || "", // Número de teléfono
      country: item.country || "",
      state: item.state || "",
      city: item.city || "",
      description: item.description || "", // Descripción
      membership: item.membership || "", // Membresía
      taxIdEIN: item.taxIdEIN || "", // TAX ID/EIN
      RNTFile: item.RNTFile || "", // Archivo RNT
      taxIdEINFile: item.taxIdEINFile || "", // Archivo TAX ID/EIN
      extraTags: (item.extraTags || []).map((tag: any) => tag.ExtraTags_id), // Etiquetas adicionales
      serviceTags: (item.serviceTags || []).map((tag: any) => tag.serviceTags_id), // Etiquetas de servicio
    }));

    return transformedData;
  } catch (error: any) {
    console.error("Error fetching providers:", error.response?.data || error.message);
    throw new Error("No se pudieron obtener los proveedores");
  }
};
