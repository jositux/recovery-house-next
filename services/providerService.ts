import axios from "axios";

const API_URL = "/webapi/items/Provider";

export interface ProviderData {
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
  // Nuevos campos de suscripción
  subscriptionPrice: string;
  subscriptionType: string;
  price: string;
}

export interface ProviderResponse {
  data: {
    id: string;
  };
}

export const providerService = {
  createProperty: async (
    providerData: ProviderData
  ): Promise<ProviderResponse> => {
    try {
      // Asegurarse de que se ejecute solo en el cliente
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

        // Transformar extraTags a [{ ExtraTags_id: string }]
        const formattedExtraTags = providerData.extraTags.map((tag) => ({
          ExtraTags_id: tag,
        }));

        // Crear una copia de los datos, sobreescribiendo userId, serviceTags y extraTags.
        // Los campos de suscripción se mantienen desde providerData.
        const transformedData = {
          ...providerData,
          userId: user_id,
          serviceTags: formattedServiceTags,
          extraTags: formattedExtraTags,
        };

        const response = await axios.post<ProviderResponse>(
          `${API_URL}`,
          transformedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Almacenar el providerId en localStorage
        localStorage.setItem("providerId", response.data.data.id);

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
            "An error occurred while creating the property"
        );
      }
      throw new Error("An unexpected error occurred");
    }
  },
};
