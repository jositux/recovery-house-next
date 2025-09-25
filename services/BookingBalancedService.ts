import axios from "axios"

const API_BASE_URL = "/webapi";

export interface BalancedBookingPayload {
    bookingId: string,
    paymentAmount: number,
    paymentDate: string,
    paymentId: string,
    paymentType: string
}

export const createBookingBalanced = async (
  payload: BalancedBookingPayload,
  accessToken: string
) => {
  const url = `${API_BASE_URL}/api/v2/booking/${payload.bookingId}/`

  payload.paymentAmount = parseFloat(payload.paymentAmount as unknown as string)
  // sacamos bookingId del body
  const { bookingId, ...data } = payload

  const response = await axios.patch(url, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  return response.data
}