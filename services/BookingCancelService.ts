import axios from "axios"

const API_BASE_URL = "/webapi";

export interface CancelBookingPayload {
  cancelledById: string
  cancelledDate: string
  cancelledMessage: string
}

export const cancelBooking = async (
  bookingId: string,
  payload: CancelBookingPayload,
  accessToken: string
) => {
  const url = `${API_BASE_URL}/api/v2/booking/${bookingId}/cancel`

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  return response.data
}