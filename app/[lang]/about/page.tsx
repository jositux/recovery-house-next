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
            className={`${fraunces.className} text-3xl font-normal mb-6 text-[#162F40]`}
          >
            {isSpanish ? "Sobre Nosotros" : "About Us"}
          </h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {/* Historia / Introducción */}
          <section className="mb-12">
            {/* Primer Párrafo */}
            <p className="leading-relaxed mb-6">
              {isSpanish
                ? "Fundados en 2025, comenzamos con una idea simple: transformar y mejorar la experiencia del turismo médico a nivel mundial. Imaginamos una plataforma integral donde los pacientes pudieran acceder a todo lo necesario para su viaje de salud, bienestar y belleza dentro de un ecosistema seguro, confiable y completamente equipado. Al reunir a clínicas líderes, profesionales de la salud, alojamientos y proveedores de servicios complementarios, facilitamos a los pacientes las búsquedas para recibir atención lejos de casa."
                : "Founded in 2025, we began with a simple idea: to transform and improve the medical tourism experience worldwide. We envisioned a one-stop platform where patients could access everything they need for their health, wellness, and beauty journey within one secure, trusted, and well-equipped ecosystem. By bringing together leading clinics, healthcare professionals, accommodations, and complementary service providers, we make it easier for patients to navigate the complexities of receiving care away from home."}
            </p>

            {/* 🎬 Video de YouTube (Ubicado debajo del primer párrafo) */}
            <div className="my-8 overflow-hidden rounded-[14px] shadow-lg aspect-video w-full not-prose">
              <iframe
                className="w-full h-full border-0"
                src="https://www.youtube.com/embed/qqNjnkc7Vrs"
                title="About Us Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Segundo Párrafo */}
            <p className="leading-relaxed">
              {isSpanish
                ? "Atrás quedaron los días de sentirse inseguro o desprotegido al explorar el turismo médico. Nos encargamos de la logística que rodea tu estadía y te conectamos con algunas de las mejores clínicas y proveedores de servicios que ofrece cada destino, permitiéndote concentrarte en lo más importante: tu salud, bienestar y experiencia. Donde quiera que te lleve tu viaje, nuestro objetivo es brindarte la confianza, la conveniencia y el apoyo que necesitas para perseguir tus metas de bienestar de manera segura y cómoda en cualquier lugar del mundo."
                : "Gone are the days of feeling uncertain or unsafe when exploring medical tourism. We take care of the logistics surrounding your stay and connect you with some of the best clinics and service providers each destination has to offer, allowing you to focus on what matters most: your health, well-being, and experience. Wherever your journey takes you, our goal is to provide the confidence, convenience, and support you need to pursue your wellness goals safely and comfortably anywhere in the world."}
            </p>
          </section>

          {/* Misión y Visión */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 not-prose">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <h2
                className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
              >
                {isSpanish ? "Misión" : "Mission"}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {isSpanish
                  ? "Conectar a los pacientes con alojamientos, cuidados y servicios complementarios confiables que les permitan sentirse respaldados durante toda su estadía, en las diferentes áreas de la salud, bienestar y belleza."
                  : "Connect patients with trusted accommodations, care, and complementary services, creating a seamless and supportive experience throughout their health, wellness, and beauty journey."}
              </p>
            </div>

            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <h2
                className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
              >
                {isSpanish ? "Visión" : "Vision"}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {isSpanish
                  ? "Ser reconocidos como pioneros en el desarrollo de una plataforma segura y confiable que conecte pacientes con un ecosistema integral de aliados de salud, bienestar, belleza y servicios complementarios."
                  : "To be recognized as a pioneer in creating a secure and trusted platform that connects patients to a comprehensive ecosystem of health, wellness, beauty, and complementary service partners."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}