import axios from "axios"

const API_BASE_URL = "/webapi";


export interface ModifyBookingPayload {
  bookingId: string,
  guests: number,
  checkInDateHour: string,
  checkOutDateHour: string,
  price: number,
  cleaning: number,
  finalPrice: number,
  discountStayType: string,
  discountPercentageStayApplied: number,
  discountStayAmount: number,
  prepaymentPercentage: number,
  paymentAmount: number,
  paymentBalance: number,
  paymentDate: string,
  paymentId: string | null,
  paymentType: string,
}

export const createBookingModify = async (
  payload: ModifyBookingPayload,
  accessToken: string
) => {
  const url = `${API_BASE_URL}/api/v2/booking/${payload.bookingId}/modify`

  payload.paymentAmount = parseFloat(payload.paymentAmount as unknown as string)
  // sacamos bookingId del body
  const { bookingId, ...data } = payload

  console.log(payload)

  const response = await axios.patch(url, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  return response.data
}