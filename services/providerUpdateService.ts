import axios from "axios";

const API_URL = "/webapi/items/Provider";

export interface ProviderData {
  id: string;
  userId: string;
  name: string;
  email: string;
  country: string;
  state: string;
  city: string;
  phone: string;
  description: string;
  membership: string;
  taxIdEIN: string;
  RNTFile: string;
  taxIdEINFile: string;
  extraTags: string[];
  serviceTags: string[];
}

export interface ProviderResponse {
  data: {
    id: string;
  };
}

export const providerService = {
  updateProvider: async (
    id: string, // id added as a parameter
    providerData: ProviderData
  ): Promise<ProviderResponse> => {
    try {
      // Check if window is defined to ensure code runs only on the client side
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Access token is missing");
        }

        const responseUser = await axios.get("/webapi/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user_id = responseUser.data.data.id;

        const formattedServiceTags = providerData.serviceTags.map((tag) => ({
          serviceTags_id: tag, // Caso general
        }));

        // Transformar extraTags a [{ extratags_id: string }]
        const formattedExtraTags = providerData.extraTags.map((tag) => ({
          ExtraTags_id: tag,
        }));

        // Crear una copia de data con servicesTags, extraTags y photos transformados
        const transformedData = {
          ...providerData,
          userId: user_id,
          serviceTags: formattedServiceTags,
          extraTags: formattedExtraTags,
        };

        // Usamos el método PATCH para actualizar la propiedad, pasando el `id` en la URL
        const response = await axios.patch<ProviderResponse>(
          `${API_URL}/${id}`, // Usar id en la URL
          transformedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } else {
        throw new Error(
          "Window is not defined. This code should run on the client side."
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "An error occurred while updating the property"
        );
      }
      throw new Error("An unexpected error occurred");
    }
  },
};
