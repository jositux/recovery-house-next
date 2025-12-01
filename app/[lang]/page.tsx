import { HeroSlider } from "@/components/hero-slider"
import { HeroSliderMobile } from "@/components/HeroSliderMobile"
import { WelcomeSection } from "@/components/sections/welcome-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { HowToUseSection } from "@/components/sections/how-to-use-section"
import { BenefitsSection } from "@/components/sections/benefits-section"
import { HostCTASection } from "@/components/sections/host-cta-section"
import { NewsSection } from "@/components/sections/news-section"
import styles from "./page.module.css"
import {type Locale/*, getTranslations*/} from "@/lib/i18n" 

// 1. Define la interfaz de los parámetros resueltos
interface HomePageParams {
  lang: Locale;
}

// 2. Define la interfaz de las Props que el componente recibe
interface HomePageProps {
  // Los parámetros son envueltos en una Promise por el App Router
  params: Promise<HomePageParams>; 
  // Nota: Si usaras searchParams, serían síncronos: searchParams: { [key: string]: string | string[] | undefined }
}


// Mantenemos async y usamos la interfaz definida
export default async function Home({
  params,
}: HomePageProps) { // <-- Aplicamos la interfaz aquí
  
  // Destructuramos el valor resuelto de la Promise
  const { lang } = await params 
  
  // Si deseas usar el diccionario, descomenta esta línea:
  // const dictionary = getTranslations(lang) 

  return (
    
    <main>
     
      <div className={`${styles.Container} hidden mt-[-124px] pt-[50px] md:block px-4`}>
        <HeroSlider lang={lang} /> 
      </div>
      <div className="md:hidden px-4">
        <HeroSliderMobile lang={lang} />
      </div>
      <WelcomeSection lang={lang} />
      <FeaturesSection lang={lang} />
      <HowToUseSection lang={lang} />
      <BenefitsSection lang={lang} />
      <TestimonialsSection lang={lang} />
      <HostCTASection lang={lang} />
      <NewsSection lang={lang} />
    </main>
  )
}