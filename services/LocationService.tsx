// src/services/locationService.ts

import axios from 'axios'; 


const API_URL = `${process.env.DIRECTUS_URL}/items/Available_Locations`

export interface LocationOption {
  id: string
  city: string
  state: string
  country: string
}

interface ApiLocationData {
  data: Array<LocationOption> // Coincide con el formato de tu API
}

export async function fetchAvailableLocations(): Promise<LocationOption[]> {
  try {
    // 🛑 USANDO AXIOS Y ENVOLVIENDO EN fetch con 'no-store'
    // La cabecera 'Cache-Control: no-store' fuerza a Next.js a no cachear la respuesta.
    // Esto significa que se hará un fetch en cada request al servidor (ISR/SSG desactivado para esta data).
    const response = await axios.get<ApiLocationData>(API_URL, {
      headers: {
        'Cache-Control': 'no-store', // 🛑 Opción clave para "alta frecuencia"
      },
      // También puedes usar una instancia de fetch para ignorar el caché, aunque Axios lo hace por HTTP headers
    });

    if (response.status !== 200) {
      console.error(`Error al obtener ubicaciones: ${response.status}`);
      return [];
    }
    
    // Los datos ya están en el formato correcto
    return response.data.data;

  } catch (error) {
    console.error("Fallo al conectar con el endpoint de ubicaciones (Axios):", error);
    return [];
  }
}