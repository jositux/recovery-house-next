import { HeroSlider } from "@/components/hero-slider"
import { HeroSliderMobile } from "@/components/HeroSliderMobile"
import { WelcomeSection } from "@/components/sections/welcome-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { HowToUseSection } from "@/components/sections/how-to-use-section"
import { BenefitsSection } from "@/components/sections/benefits-section"
//import { CareDividerSection } from "@/components/sections/care-divider-section"
import { HostCTASection } from "@/components/sections/host-cta-section"
import { NewsSection } from "@/components/sections/news-section"
import styles from "./page.module.css"


export default function Home() {
  return (
    
    <main>
     
      <div className={`${styles.Container} hidden mt-[-124px] pt-[50px] md:block px-4`}>
        <HeroSlider lang="es"/>
      </div>
      <div className="md:hidden px-4">
        <HeroSliderMobile lang="es"/>
      </div>
      <WelcomeSection lang="es"/>
      <FeaturesSection lang="es"/>
      <HowToUseSection lang="es"/>
      <BenefitsSection lang="es" />
      <TestimonialsSection lang="es"/>
      {/*
      <CareDividerSection />
  */}
      <HostCTASection lang="es"/>
      <NewsSection lang="es"/>
    </main>
  )
}

