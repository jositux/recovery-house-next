//import { Separator } from "@/components/ui/separator"
import { Mail, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-muted-foreground">
            Plataforma Recovery Care Solutions
          </p>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            1. Aceptación de la Política
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              El uso de la plataforma Recovery Care Solutions (en adelante, la
              Plataforma) implica la aceptación de la presente Política de
              Privacidad, así como el consentimiento para el tratamiento de los
              datos personales proporcionados por el usuario.
            </p>
            <p className="leading-relaxed">
              Toda persona que acceda, navegue, se registre o utilice los
              servicios ofrecidos declara haber leído, comprendido y aceptado
              esta política.
            </p>
            <p className="leading-relaxed">
              En caso de no estar de acuerdo con alguna de las condiciones aquí
              establecidas, se recomienda no utilizar la Plataforma.
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            2. Información Recopilada
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              La Plataforma recopila información personal proporcionada por el
              usuario al registrarse, realizar reservas o interactuar con los
              servicios, incluyendo nombre, correo electrónico, número de
              teléfono y datos de pago.
            </p>
            <p className="leading-relaxed">
              También se pueden recopilar datos sobre la actividad del usuario
              dentro de la Plataforma, como historial de reservas y preferencias
              de servicios, con el fin de mejorar la experiencia y seguridad.
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">3. Uso de la Información</h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              Los datos personales serán utilizados exclusivamente para:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li className="leading-relaxed">
                Gestionar reservas y servicios solicitados por el usuario.
              </li>
              <li className="leading-relaxed">
                Brindar asistencia, soporte y comunicación sobre la Plataforma.
              </li>
              <li className="leading-relaxed">
                Cumplir obligaciones legales y de seguridad.
              </li>
              <li className="leading-relaxed">
                Mejorar los servicios, analizar estadísticas y tendencias de
                uso.
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">4. Compartición de Datos</h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              La Plataforma puede compartir información personal únicamente con:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li className="leading-relaxed">
                Proveedores de servicios esenciales para la gestión de reservas y
                atención personalizada.
              </li>
              <li className="leading-relaxed">
                Autoridades competentes cuando sea requerido por ley.
              </li>
              <li className="leading-relaxed">
                En casos de seguridad y prevención de fraude.
              </li>
            </ul>
            <p className="leading-relaxed">
              En ningún caso se venderán datos personales a terceros con fines
              comerciales.
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            5. Seguridad de la Información
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              Recovery Care Solutions implementa medidas técnicas y
              organizativas razonables para proteger los datos personales frente
              a pérdida, uso indebido, acceso no autorizado, divulgación o
              modificación.
            </p>
            <p className="leading-relaxed">
              El usuario es responsable de mantener la confidencialidad de sus
              credenciales y notificar cualquier uso no autorizado de su
              cuenta.
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">6. Derechos del Usuario</h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              El usuario puede ejercer los siguientes derechos sobre sus datos:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li className="leading-relaxed">Acceder a sus datos personales.</li>
              <li className="leading-relaxed">Rectificar información incorrecta.</li>
              <li className="leading-relaxed">Solicitar la eliminación de sus datos.</li>
              <li className="leading-relaxed">
                Limitar o oponerse al procesamiento de datos.
              </li>
              <li className="leading-relaxed">
                Solicitar la portabilidad de sus datos.
              </li>
            </ul>
            <p className="leading-relaxed">
              Para ejercer estos derechos, el usuario puede contactar al equipo
              de soporte mediante los datos indicados en la sección de Contacto.
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">7. Cookies y Tecnologías Similares</h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              La Plataforma utiliza cookies y tecnologías similares para mejorar
              la experiencia del usuario, recordar preferencias y analizar el
              tráfico de la Plataforma.
            </p>
            <p className="leading-relaxed">
              El usuario puede configurar su navegador para rechazar cookies,
              aunque algunas funcionalidades de la Plataforma podrían verse
              limitadas.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Contacto</h2>
          <p className="mb-4 leading-relaxed">
            Para consultas, solicitudes de acceso, rectificación o eliminación de
            datos, puede comunicarse con:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <a
                href="mailto:soporte@recoverycaresolutions.com"
                className="text-primary hover:underline"
              >
                soporte@recoverycaresolutions.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <a
                href="https://www.recoverycaresolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.recoverycaresolutions.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12">
          <p>
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES", {
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
