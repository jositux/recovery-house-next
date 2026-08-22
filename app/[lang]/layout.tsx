import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n";
import { Header } from "./header";
import { Footer } from "@/components/footer";
import { PageTracker } from "react-page-tracker";
import { fetchAvailableLocations, type LocationOption } from "@/services/LocationService";
import { FadeWrapper } from "./FadeWrapper";

// 💡 Simulamos una función para obtener traducciones de metadata
async function getMetadataByLang(lang: Locale): Promise<{ title: string; description: string }> {
  if (lang === "es") {
    return {
      title: "Soluciones de Cuidado de Recuperación",
      description: "Conectamos pacientes con casas de recuperación en todo el mundo (Traducción ES)",
    };
  }
  return {
    title: "Recovery Care Solutions",
    description: "Connecting patients with recovery homes worldwide (EN Translation)",
  };
}

// 🛑 PASO CLAVE: Usamos 'string' en params para complacer el validador de Next.js
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Locale = rawLang === "en" ? "en" : "es";

  const translatedMetadata = await getMetadataByLang(lang);

  return {
    title: translatedMetadata.title,
    description: translatedMetadata.description,
  };
}

// 🛑 Componente Layout
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: rawLang } = await params;
  const lang: Locale = rawLang === "en" ? "en" : "es";

  const availableLocations: LocationOption[] = await fetchAvailableLocations();

  return (
    <>
      {/* HEADER con fade in */}
      <FadeWrapper delay={0.2}>
        <Header lang={lang} availableLocations={availableLocations} />
      </FadeWrapper>

      {/* MAIN con fade in */}
      <FadeWrapper delay={1}>
        <main className="max-auto relative z-0">
          <PageTracker />
          {children}
        </main>
      </FadeWrapper>

      {/* FOOTER */}
      <Footer lang={lang} />
    </>
  );
}