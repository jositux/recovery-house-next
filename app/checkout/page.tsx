'use client'

import { CheckoutForm } from "@/app/checkout/CheckoutForm";
import React, { useState, useEffect } from "react";

const CheckoutPage = () => {
    // Aquí se establece el priceId de manera fija por simplicidad
    const priceId = 'price_1PdILZFcneaRmfHyuWbuhpMB'

    const [bookingData, setBookingData] = useState<{
      name?: string;
      description?: string;
      unit_amount?: number;
  }>({});
  
    const [isLoading, setIsLoading] = useState(true);  // Estado para verificar si los datos están cargados

    // Leer datos del localStorage al cargar el componente
    useEffect(() => {
        const storedBooking = localStorage.getItem("booking");
        if (storedBooking) {
            try {
                const parsedBooking = JSON.parse(storedBooking);
                setBookingData(parsedBooking);
            } catch (error) {
                console.error("Error parsing booking data from localStorage:", error);
            }
        }
        
        // Aseguramos que el estado se ha actualizado antes de renderizar
        setIsLoading(false);
    }, []);  // Se ejecuta solo una vez al cargar el componente

    // Mientras se cargan los datos, puedes mostrar un loading o un mensaje
    if (isLoading) {
        return <div>Loading...</div>;  // Puedes personalizar este mensaje o añadir un spinner
    }

    return (
        <main>
            <div className="max-w-screen-lg mx-auto my-8">
                <CheckoutForm priceId={priceId} bookingData={bookingData} />
            </div>
        </main>
    )
}

export default CheckoutPage;
