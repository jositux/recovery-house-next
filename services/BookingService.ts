import axios from "axios";

const API_BASE_URL = "/webapi";

// Obtener información del usuario actual
export const fetchCurrentUser = async (accessToken: string): Promise<{
  id: string;
  first_name: string;
  last_name: string;
}> => {
  const response = await axios.get(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const user = response.data.data;

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
  };
};

// Crear una nueva reserva
export const createBooking = async (
  bookingData: {
    status: string;
    checkIn: string;
    checkOut: string;
    patient: string;
    patientName: string;
    ownerId: string;
    ownerName: string;
    guests: number;
    price: number;
    cleaning: number;
    room: string;
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
