import axios from "axios"


export interface DeletePropertyResponse {
  id: string
  status: "deleted" | "error"
  message?: string
}

export const propertyDeleteService = {
  deleteProperty: async (id: string, accessToken: string): Promise<DeletePropertyResponse> => {
    try {
      await axios.delete(`webapi/items/Property/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      return {
        id,
        status: "deleted",
        message: "Property deleted successfully",
      }
    } catch (error) {
      console.error("Error deleting property:", error)
      return {
        id,
        status: "error",
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "An unknown error occurred",
      }
    }
  },
}

