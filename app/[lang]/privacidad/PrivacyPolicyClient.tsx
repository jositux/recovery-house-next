"use client";

import { Mail, Globe } from "lucide-react";
import { type Locale } from "@/lib/i18n";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

export function PrivacyPolicyClient({ lang }: { lang: Locale }) {
  const isSpanish = lang === "es";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header Principal */}
        <div className="mb-12">
          <h1
            className={`${fraunces.className} text-2xl md:text-4xl font-normal mb-6 text-balance`}
          >
            {isSpanish ? "Política de Privacidad" : "Privacy Policy"}
          </h1>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {isSpanish
              ? "Plataforma Recovery Care Solutions"
              : "Recovery Care Solutions Platform"}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12">
          {/* 1. Aceptación */}
          <section className="border-b border-border pb-8">
            <h2
              className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
            >
              {isSpanish
                ? "1. Aceptación de la Política"
                : "1. Acceptance of Policy"}
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                {isSpanish
                  ? "El uso de la plataforma Recovery Care Solutions (en adelante, la Plataforma) implica la aceptación de la presente Política de Privacidad, así como el consentimiento para el tratamiento de los datos personales proporcionados por el usuario."
                  : "The use of the Recovery Care Solutions platform (hereinafter, the Platform) implies acceptance of this Privacy Policy, as well as consent for the processing of personal data provided by the user."}
              </p>
              <p className="leading-relaxed">
                {isSpanish
                  ? "Toda persona que acceda, navegue, se registre o utilice los servicios ofrecidos declara haber leído, comprendido y aceptado esta política."
                  : "Anyone who accesses, browses, registers, or uses the offered services declares that they have read, understood, and accepted this policy."}
              </p>
              <p className="leading-relaxed">
                {isSpanish
                  ? "En caso de no estar de acuerdo con alguna de las condiciones aquí establecidas, se recomienda no utilizar la Plataforma."
                  : "If you do not agree with any of the conditions set forth here, it is recommended not to use the Platform."}
              </p>
            </div>
          </section>

          {/* 2. Información Recopilada */}
          <section className="border-b border-border pb-8">
            <h2
              className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
            >
              {isSpanish
                ? "2. Información Recopilada"
                : "2. Information Collected"}
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                {isSpanish
                  ? "La Plataforma recopila información personal proporcionada por el usuario al registrarse, realizar reservas o interactuar con los servicios, incluyendo nombre, correo electrónico, número de teléfono y datos de pago."
                  : "The Platform collects personal information provided by the user when registering, making bookings, or interacting with the services, including name, email, phone number, and payment data."}
              </p>
              <p className="leading-relaxed">
                {isSpanish
                  ? "También se pueden recopilar datos sobre la actividad del usuario dentro de la Plataforma, como historial de reservas y preferencias de servicios, con el fin de mejorar la experiencia y seguridad."
                  : "Data may also be collected about the user's activity within the Platform, such as booking history and service preferences, in order to improve experience and security."}
              </p>
            </div>
          </section>

          {/* 3. Uso de la Información */}
          <section className="border-b border-border pb-8">
            <h2
              className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
            >
              {isSpanish ? "3. Uso de la Información" : "3. Use of Information"}
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                {isSpanish
                  ? "Los datos personales serán utilizados exclusivamente para:"
                  : "Personal data will be used exclusively for:"}
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Gestionar reservas y servicios solicitados por el usuario."
                    : "Managing bookings and services requested by the user."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Brindar asistencia, soporte y comunicación sobre la Plataforma."
                    : "Providing assistance, support, and communication regarding the Platform."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Cumplir obligaciones legales y de seguridad."
                    : "Complying with legal and security obligations."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Mejorar los servicios, analizar estadísticas y tendencias de uso."
                    : "Improving services, analyzing statistics and usage trends."}
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Compartición de Datos */}
          <section className="border-b border-border pb-8">
            <h2
              className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
            >
              {isSpanish ? "4. Compartición de Datos" : "4. Data Sharing"}
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                {isSpanish
                  ? "La Plataforma puede compartir información personal únicamente con:"
                  : "The Platform may share personal information only with:"}
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Proveedores de servicios esenciales para la gestión de reservas y atención personalizada."
                    : "Service providers essential for managing bookings and personalized support."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Autoridades competentes cuando sea requerido por ley."
                    : "Relevant authorities when required by law."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "En casos de seguridad y prevención de fraude."
                    : "In cases of security and fraud prevention."}
                </li>
              </ul>
              <p className="leading-relaxed">
                {isSpanish
                  ? "En ningún caso se venderán datos personales a terceros con fines comerciales."
                  : "Personal data will never be sold to third parties for commercial purposes."}
              </p>
            </div>
          </section>

          {/* 5. Seguridad */}
          <section className="border-b border-border pb-8">
            <h2
              className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
            >
              {isSpanish
                ? "5. Seguridad de la Información"
                : "5. Information Security"}
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                {isSpanish
                  ? "Recovery Care Solutions implementa medidas técnicas y organizativas razonables para proteger los datos personales frente a pérdida, uso indebido, acceso no autorizado, divulgación o modificación."
                  : "Recovery Care Solutions implements reasonable technical and organizational measures to protect personal data against loss, misuse, unauthorized access, disclosure, or modification."}
              </p>
              <p className="leading-relaxed">
                {isSpanish
                  ? "El usuario es responsable de mantener la confidencialidad de sus credenciales y notificar cualquier uso no autorizado de su cuenta."
                  : "The user is responsible for keeping their credentials confidential and reporting any unauthorized use of their account."}
              </p>
            </div>
          </section>

          {/* 6. Derechos del Usuario */}
          <section className="border-b border-border pb-8">
            <h2
              className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
            >
              {isSpanish ? "6. Derechos del Usuario" : "6. User Rights"}
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                {isSpanish
                  ? "El usuario puede ejercer los siguientes derechos sobre sus datos:"
                  : "Users may exercise the following rights over their data:"}
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Acceder a sus datos personales."
                    : "Access their personal data."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Rectificar información incorrecta."
                    : "Correct inaccurate information."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Solicitar la eliminación de sus datos."
                    : "Request the deletion of their data."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Limitar o oponerse al procesamiento de datos."
                    : "Restrict or object to data processing."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Solicitar la portabilidad de sus datos."
                    : "Request data portability."}
                </li>
              </ul>
              <p className="leading-relaxed">
                {isSpanish
                  ? "Para ejercer estos derechos, el usuario puede contactar al equipo de soporte mediante los datos indicados en la sección de Contacto."
                  : "To exercise these rights, users can contact the support team using the information provided in the Contact section."}
              </p>
            </div>
          </section>

          {/* 7. Cookies */}
          <section className="border-b border-border pb-8">
            <h2
              className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
            >
              {isSpanish
                ? "7. Cookies y Tecnologías Similares"
                : "7. Cookies and Similar Technologies"}
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                {isSpanish
                  ? "La Plataforma utiliza cookies y tecnologías similares para mejorar la experiencia del usuario, recordar preferencias y analizar el tráfico de la Plataforma."
                  : "The Platform uses cookies and similar technologies to improve user experience, remember preferences, and analyze Platform traffic."}
              </p>
              <p className="leading-relaxed">
                {isSpanish
                  ? "El usuario puede configurar su navegador para rechazar cookies, aunque algunas funcionalidades de la Plataforma podrían verse limitadas."
                  : "Users can configure their browser to reject cookies, although some Platform functionalities may be limited."}
              </p>
            </div>
          </section>

          {/* 8. Contacto */}
          <section>
            <h2
              className={`${fraunces.className} text-xl md:text-2xl font-normal mb-3 text-foreground`}
            >
              {isSpanish ? "8. Contacto" : "8. Contact"}
            </h2>
            <p className="mb-4 leading-relaxed">
              {isSpanish
                ? "Para consultas, solicitudes de acceso, rectificación o eliminación de datos, puede comunicarse con:"
                : "For inquiries, access requests, correction or deletion of data, you may contact:"}
            </p>
            <div className="space-y-3 not-prose">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:manager@recoverycaresolutions.com"
                  className="text-primary hover:underline text-sm md:text-base"
                >
                  manager@recoverycaresolutions.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <a
                  href="https://recoverycaresolutions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm md:text-base"
                >
                  recoverycaresolutions.com
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Fecha */}
        <div className="text-center text-xs md:text-sm text-muted-foreground mt-16 pt-8 border-t border-border">
          <p>
            {isSpanish ? "Última actualización: " : "Last updated: "}{" "}
            {new Date().toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}