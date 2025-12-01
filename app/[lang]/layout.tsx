import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n" 
import { Header } from "./header";
import { Footer } from "@/components/footer";
import { PageTracker } from "react-page-tracker";
import { fetchAvailableLocations, type LocationOption } from "@/services/LocationService";

// 💡 Simulamos una función para obtener traducciones de metadata
async function getMetadataByLang(lang: Locale): Promise<{ title: string; description: string }> {
    if (lang === 'es') {
        return {
            title: "Soluciones de Cuidado de Recuperación",
            description: "Conectamos pacientes con casas de recuperación en todo el mundo (Traducción ES)",
        };
    }
    // Default o 'en'
    return {
        title: "Recovery Care Solutions",
        description: "Connecting patients with recovery homes worldwide (EN Translation)",
    };
}


// 🛑 PASO CLAVE: Usar generateMetadata (función asíncrona)
export async function generateMetadata({ 
    params 
}: { 
    params: { lang: Locale } 
}): Promise<Metadata> {
    
    const { lang } = params;
    const translatedMetadata = await getMetadataByLang(lang);

    return {
        // La metadata dinámica se fusiona con la estática del layout raíz
        title: translatedMetadata.title,
        description: translatedMetadata.description,
        
        // El resto de la metadata (icons, etc.) se hereda del layout raíz.
    };
}


// 🛑 Componente Layout (sin html, head, o body)
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { lang: Locale } 
}>) {
  
  const { lang } = params 

  // LLAMADA AL SERVICIO
  const availableLocations: LocationOption[] = await fetchAvailableLocations();
  
  return (
    <> 
      {/* El atributo lang debe ser establecido en el <html> del layout raíz,
          pero el middleware se asegura de que el contenido use este lang. */}
      <Header lang={lang} availableLocations={availableLocations} /> 
      <main className="max-auto relative z-0">
        <PageTracker />
        {children}
      </main>
       
      <Footer lang={lang} />
    </>
  );
}