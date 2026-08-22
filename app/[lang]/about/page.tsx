"use client";

import { type Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

export default function AboutUsClient() {
  const params = useParams();

  // Validación segura para evitar problemas de tipos con Locale
  const rawLang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
  const lang: Locale = rawLang === "en" ? "en" : "es";
  const isSpanish = lang === "es";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12">
          <h1
            className={`${fraunces.className} text-2xl md:text-4xl font-normal mb-6 text-balance`}
          >
            {isSpanish ? "Sobre Nosotros" : "About Us"}
          </h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <p className="leading-relaxed mb-6">
              {isSpanish
                ? "Fundados en 2025, comenzamos con una idea simple: transformar y mejorar la experiencia del turismo médico a nivel mundial. Imaginamos una plataforma integral donde los pacientes pudieran acceder a todo lo necesario para su viaje de salud, bienestar y belleza dentro de un ecosistema seguro, confiable y completamente equipado. Al reunir a clínicas líderes, profesionales de la salud, alojamientos y proveedores de servicios complementarios, facilitamos a los pacientes la navegación por las complejidades de recibir atención lejos de casa."
                : "Founded in 2025, we began with a simple idea: to transform and improve the medical tourism experience worldwide. We envisioned a one-stop platform where patients could access everything they need for their health, wellness, and beauty journey within one secure, trusted, and well-equipped ecosystem. By bringing together leading clinics, healthcare professionals, accommodations, and complementary service providers, we make it easier for patients to navigate the complexities of receiving care away from home."}
            </p>

            <p className="leading-relaxed mb-8">
              {isSpanish
                ? "Atrás quedaron los días de sentirse inseguro o desprotegido al explorar el turismo médico. Nos encargamos de la logística que rodea tu estadía y te conectamos con algunas de las mejores clínicas y proveedores de servicios que ofrece cada destino, permitiéndote concentrarte en lo más importante: tu salud, bienestar y experiencia. Dondequiera que te lleve tu viaje, nuestro objetivo es brindarte la confianza, la conveniencia y el apoyo que necesitas para perseguir tus metas de bienestar de manera segura y cómoda en cualquier lugar del mundo."
                : "Gone are the days of feeling uncertain or unsafe when exploring medical tourism. We take care of the logistics surrounding your stay and connect you with some of the best clinics and service providers each destination has to offer, allowing you to focus on what matters most: your health, well-being, and experience. Wherever your journey takes you, our goal is to provide the confidence, convenience, and support you need to pursue your wellness goals safely and comfortably anywhere in the world."}
            </p>
          </section>

          {/* 🎬 Video de YouTube embebido con bordes redondeados a 14px */}
          <div className="mt-8 overflow-hidden rounded-[14px] shadow-lg aspect-video w-full">
            <iframe
              className="w-full h-full border-0"
              src="https://www.youtube.com/embed/uclDGx0GLz8"
              title="About Us Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}