import axios from "axios"

interface DisabledDatesPayload {
  roomId: string
  disabledDates: string
}

export const serviceRoomDisabled = {
  updateRoomAvailability: async (roomId: string, disableDates: string, accessToken: string) => {
    try {
      const response = await axios.patch(
        `/webapi/items/Room/${roomId}`,
        { disableDates },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )
      return response.data
    } catch (error) {
      console.error("Error updating room availability:", error)
      throw error
    }
  },
}
