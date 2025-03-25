import axios from "axios"

interface EnabledDatesPayload {
  roomId: string
  unavailableDates: string[]
}

export const serviceRoomEnabled = {
  updateRoomAvailability: async (roomId: string, unavailableDates: string[]) => {
    try {
      const response = await axios.patch(`/Rooms/${roomId}`, {
        unavailableDates,
      })
      return response.data
    } catch (error) {
      console.error("Error updating room availability:", error)
      throw error
    }
  },
}

