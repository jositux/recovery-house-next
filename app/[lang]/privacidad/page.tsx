import { type Locale } from "@/lib/i18n";
// Importamos el componente de cliente
import { PrivacyPolicyClient } from "./PrivacyPolicyClient"; 

// Hacemos el componente ASÍNCRONO y definimos los tipos en la función
export default async function PrivacyPolicyPage({ 
  params,
}: { 
  // 🛑 SOLUCIÓN: Definimos params como una PROMESA del objeto que esperamos.
  // Esto cumple con la restricción interna de PageProps para funciones async.
  params: Promise<{ lang: Locale }>; 
}) {
  
  // 🛑 Hacemos el AWAIT explícito. Esto resuelve la promesa y evita el error de tipado.
  const resolvedParams = await params;
  
  // Accedemos a lang del objeto resuelto, manteniendo la seguridad de tipos.
  const lang = (resolvedParams.lang as Locale) || "es"; 
  
  // Renderizamos el componente cliente, pasándole el idioma como un prop simple.
  return <PrivacyPolicyClient lang={lang} />;
}