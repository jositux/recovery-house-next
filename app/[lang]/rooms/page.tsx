import { Suspense } from "react";
import { type Locale } from "@/lib/i18n";
import { RoomsPageClient } from "./RoomsPageClient"; // Importamos el nuevo componente cliente

// 1. Definición de las propiedades del Server Component.
// 1. Define la interfaz de los parámetros de la ruta
interface RoomPageParams {
  lang: Locale;
}

// 2. Define la interfaz de las Props que el componente de página recibe
interface RoomPageProps {
  // Debe ser Promise para cumplir con la PageProps del App Router
  params: Promise<RoomPageParams>; 
}

// 2. Componente de página principal (Server Component)
// El Server Component recibe las props y pasa 'lang' al componente cliente.
export default async function RoomPage({
  params,
}: RoomPageProps) {
   // Resuelve la Promise de los parámetros
   const resolvedParams = await params;
   const { lang } = resolvedParams;

  return (
    <main className="flex flex-col min-h-screen lg:pl-8 md:pl-8">
      {/* 3. Encapsulamos el Cliente Component en Suspense */}
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            Cargando...
          </div>
        }
      >
        {/* El componente cliente leerá 'searchParams' internamente con useSearchParams() */}
        <RoomsPageClient lang={lang} />
      </Suspense>
    </main>
  );
}