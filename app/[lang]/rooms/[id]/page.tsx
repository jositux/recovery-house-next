// NO lleva "use client"
import { type Locale } from "@/lib/i18n";
import { RoomDetailsClient } from "./RoomDetailsClient";

// 1. Define la interfaz de los parámetros de la ruta
interface RoomPageParams {
  lang: Locale;
  id: string | string[]; 
}

// 2. Define la interfaz de las Props que el componente de página recibe
interface RoomPageProps {
  // Debe ser Promise para cumplir con la PageProps del App Router
  params: Promise<RoomPageParams>; 
}

// Debe ser async para resolver la Promise de params
export default async function RoomPage({
  params,
}: RoomPageProps) {
  
  // Resuelve la Promise de los parámetros
  const resolvedParams = await params;
  const { lang } = resolvedParams;
  // Nota: El 'id' se lee dentro del Client Component (RoomDetailsClient) usando useParams()
  // porque ahí es donde ocurre toda la lógica de fetch que depende del 'id'.

  // Renderiza el Client Component, pasándole la prop 'lang'
  return (
    <RoomDetailsClient lang={lang} />
  );
}