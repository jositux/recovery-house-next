import axios from "axios";

const API_BASE_URL = "/webapi";

// Obtener información del usuario actual
export const fetchCurrentUser = async (accessToken: string) => {
  const response = await axios.get(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data.data;
};

// Crear una nueva reserva
export const createBooking = async (
  bookingData: {
    status: string;
    checkIn: string;
    checkOut: string;
    patient: string;
    patientName: string;
    propertyName: string;
    guests: number;
    price: number;
    cleaning: number;
    room: string;
    roomName: string;
    roomDescription: string;
   // ownerId: string;
    ownerName: string;
    isPrivate: boolean;
    singleBeds: number;
    doubleBeds: number;
    singleBedPrice: number;
    doubleBedPrice: number;
    singleBedCleaningPrice: number;
    doubleBedCleaningPrice: number;
    paymentId: string;
  },
  accessToken: string
) => {
  const response = await axios.post(
    `${API_BASE_URL}/items/Booking`,
    bookingData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};
