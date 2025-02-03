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

export default function Home() {
  return (
    <main>
      <div className="hidden md:block">
        <HeroSlider />
      </div>
      <div className="md:hidden">
        <HeroSliderMobile/>
      </div>
      <WelcomeSection />
      <FeaturesSection />
      <HowToUseSection />
      <BenefitsSection />
      <TestimonialsSection />
      {/*
      <CareDividerSection />
  */}
      <HostCTASection />
      <NewsSection />
    </main>
  )
}

