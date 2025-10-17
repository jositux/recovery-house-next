//import { Separator } from "@/components/ui/separator"
import { Mail, Globe } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-xl text-muted-foreground">
            Plataforma Recovery Care Solutions
          </p>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            1. Aceptación de los Términos
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              El uso de la plataforma Recovery Care Solutions (en adelante, la
              Plataforma) implica la aceptación plena y sin reservas de los
              presentes Términos y Condiciones de Uso.
            </p>
            <p className="leading-relaxed">
              Toda persona que acceda, navegue, se registre o utilice los
              servicios ofrecidos declara haber leído, comprendido y aceptado
              estos términos.
            </p>
            <p className="leading-relaxed">
              En caso de no estar de acuerdo con alguna de las condiciones aquí
              establecidas, se recomienda no utilizar la Plataforma.
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            2. Objeto de la Plataforma
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              Recovery Care Solutions es una plataforma digital que facilita la
              gestión de reservas de alojamiento temporal, asistencia y
              servicios complementarios orientados a personas que requieren
              estadías de recuperación, acompañamiento o atención personalizada.
            </p>
            <p className="leading-relaxed">
              La Plataforma actúa como intermediario tecnológico entre los
              usuarios (huéspedes, familiares o acompañantes) y los prestadores
              de servicios (propietarios, coordinadores o establecimientos
              asociados).
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">3. Registro de Usuarios</h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              Para acceder a los servicios de la Plataforma, el usuario deberá
              crear una cuenta personal proporcionando información veraz,
              completa y actualizada.
            </p>
            <p className="leading-relaxed">
              El usuario se compromete a mantener la confidencialidad de sus
              credenciales de acceso y será responsable por toda actividad
              realizada desde su cuenta.
            </p>
            <p className="leading-relaxed">
              Recovery Care Solutions no será responsable de los daños o
              perjuicios derivados del uso indebido de las credenciales de
              acceso ni de la falsedad de los datos proporcionados.
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">4. Definición y Alcance</h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              Estos Términos y Condiciones regulan las políticas de anulación y
              modificación de reservas realizadas a través de la plataforma
              Recovery Care Solutions.
            </p>
            <p className="leading-relaxed">
              Toda reserva confirmada implica la aceptación expresa de estas
              condiciones por parte del usuario.
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            5. Políticas de Anulación de Reserva
          </h2>
          <div className="space-y-6">
            {/* 5.1 Definición */}
            <div>
              <h3 className="text-xl font-semibold mb-3">5.1. Definición</h3>
              <p className="leading-relaxed">
                La anulación de reserva se refiere al proceso mediante el cual
                el usuario cancela una reserva confirmada antes del inicio de la
                estadía. Estas políticas establecen los plazos, condiciones y
                posibles reembolsos según el tipo de estadía y el momento en que
                se solicita la anulación.
              </p>
            </div>

            {/* 5.3 Condiciones Generales */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                5.2. Objeciones a las políticas de reserva{" "}
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                Estas serían políticas que harían que se les reembolse a los
                huéspedes independiente de la política establecida por el
                anfitrión y que a su vez le darían libertad al anfitrión de
                cancelar la reserva del huésped sobre el tiempo. En cualquier
                caso aplican cuando ocurran en la ciudad de destino.
                <li className="leading-relaxed">
                  Desastres naturales que impidan llegar al Hospedaje o que
                  estén afectando el destino, no la procedencia.
                </li>
                <li className="leading-relaxed">
                  Pandemias o Epidemias explícitamente declaradas por los
                  organismos gubernamentales de salud publica de la locación de
                  destino.
                </li>
                <li className="leading-relaxed">
                  Mítines, guerras civiles o militares en la ciudad de destino.
                </li>
                <li className="leading-relaxed">
                  Si se presenta un inconveniente a la llegada que el anfitrión
                  no puede resolver en máximo 5 horas
                </li>
              </ul>
            </div>

            {/* 5.2 Condiciones según tipo de estadía */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                5.3. Condiciones según el tipo de estadía
              </h3>

              {/* Estadía Corta */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  a. Estadía Corta (1 a 5 noches)
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">
                      Dentro de las primeras 24 horas posteriores a la reserva:
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Anulación gratuita con devolución del 100% del monto
                      pagado.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Después de 24 horas:</p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → No hay reembolso. Se retiene el anticipo y cualquier
                      saldo pagado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadía Media */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  b. Estadía Media (6 a 9 noches)
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">
                      Dentro de las primeras 24 horas posteriores a la reserva:
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Anulación gratuita con devolución del 100% del monto
                      pagado.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Después de 24 horas:</p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → No hay reembolso. Se retiene el anticipo y cualquier
                      saldo pagado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadía Larga */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  c. Estadía Larga (10 o más noches)
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">
                      Dentro de las primeras 24 horas posteriores a la reserva:
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Anulación gratuita con devolución del 100% del monto
                      pagado.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      Entre las 24 horas y los 15 días desde la reserva:
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Devolución del 50% del monto pagado.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      Después de 15 días desde la reserva:
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Se devuelve el monto total menos el anticipo, el cual se
                      retiene como penalización.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      Si el pago del saldo no se completa 72 horas antes del
                      check-in:
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → El anticipo se pierde en su totalidad como penalización.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5.3 Condiciones Generales */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                5.4. Condiciones Generales de Anulación
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li className="leading-relaxed">
                  Las anulaciones deben realizarse exclusivamente a través de la
                  plataforma Recovery Care Solutions o mediante contacto directo
                  con el equipo de soporte autorizado.
                </li>
                <li className="leading-relaxed">
                  Los reembolsos aplicables se procesarán en un plazo máximo de
                  10 días hábiles, utilizando el mismo medio de pago empleado
                  por el usuario.
                </li>
                <li className="leading-relaxed">
                  Recovery Care Solutions se reserva el derecho de revisar las
                  solicitudes de anulación en casos excepcionales debidamente
                  justificados (por ejemplo, causas médicas documentadas).
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">6. Formas de Pago</h2>
          <div className="space-y-6">
            <p className="leading-relaxed">
              Recovery Care Solutions ofrece dos modalidades de pago para
              adaptarse a las necesidades de cada huésped:
            </p>

            {/* 6.1 Pago Total */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">6.1. Pago Total</h3>
              <p className="leading-relaxed">
                El huésped puede abonar el 100% del monto total al momento de
                realizar la reserva, asegurando de inmediato su estadía sin
                necesidad de pagos posteriores.
              </p>
            </div>

            {/* 6.2 Pago con Anticipo */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">
                6.2. Pago con Anticipo (10%)
              </h3>
              <p className="leading-relaxed mb-4">
                Se permite al huésped pagar un anticipo equivalente al 10% del
                total para asegurar la reserva y completar el pago restante en
                una fecha posterior.
              </p>
              <div className="space-y-3 pl-4">
                <div>
                  <p className="font-medium mb-1">Condiciones del anticipo:</p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                    <li>
                      La reserva con anticipo incluye anulación gratuita durante
                      las primeras 24 horas posteriores a la confirmación.
                    </li>
                    <li>
                      Para estadías largas (+10 noches), el anticipo puede ser
                      reembolsable bajo ciertas condiciones, según las políticas
                      detalladas de cancelación vigentes en Recovery Care
                      Solutions.
                    </li>
                    <li>
                      Si el pago total no se completa 72 horas antes del
                      check-in, la reserva puede ser anulada y el anticipo
                      retenido como penalización.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            7. Políticas de Modificación de Reserva
          </h2>
          <div className="space-y-6">
            {/* 7.1 Definición */}
            <div>
              <h3 className="text-xl font-semibold mb-3">7.1. Definición</h3>
              <p className="leading-relaxed">
                La modificación de reserva permite al usuario realizar cambios
                en una reserva confirmada, tales como fechas de estadía, número
                de huéspedes u otros detalles relevantes. Las condiciones
                dependen del tipo de estadía y del tiempo restante antes del
                check-in.
              </p>
            </div>

            {/* 7.2 Condiciones según tipo de estadía */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                7.2. Condiciones según el tipo de estadía
              </h3>

              {/* Estadías Cortas y Medias */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  a. Estadías Cortas y Medias (1 a 9 noches)
                </h4>
                <div className="space-y-2">
                  <p className="font-medium">
                    Modificaciones: No permitidas bajo ninguna circunstancia.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    En caso de necesitar cambios, el usuario deberá anular la
                    reserva bajo las condiciones establecidas en la sección de
                    Anulación de Reserva y efectuar una nueva reserva.
                  </p>
                </div>
              </div>

              {/* Estadías Largas */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  b. Estadías Largas (10 o más noches)
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">
                      Modificaciones permitidas:
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Se permite una (1) modificación gratuita por reserva,
                      que puede incluir cambio de fechas y otros detalles
                      relacionados.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Plazos para modificar:</p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Hasta 6 meses antes del check-in, o
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Hasta 72 horas antes del check-in para reservas con
                      menos de 6 meses de anticipación.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Ajuste de precios:</p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → En caso de que las fechas modificadas alteren la tarifa
                      vigente, la diferencia será sumada o restada al saldo
                      pendiente.
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      → Si el cambio genera un monto a favor del usuario, este
                      podrá ser utilizado en futuras reservas o reembolsado
                      según las políticas de devolución vigentes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            8. Consideraciones Adicionales
          </h2>
          <ul className="space-y-3 list-disc list-inside">
            <li className="leading-relaxed">
              Cualquier solicitud fuera de los plazos establecidos será
              considerada no válida y no generará derecho a reembolso o
              modificación.
            </li>
            <li className="leading-relaxed">
              Recovery Care Solutions no se hace responsable por gastos
              adicionales o perjuicios indirectos derivados de una anulación o
              modificación (por ejemplo, transporte, servicios externos, etc.).
            </li>
            <li className="leading-relaxed">
              La empresa podrá realizar ajustes o actualizaciones a estas
              políticas en cualquier momento, los cuales se aplicarán a las
              nuevas reservas efectuadas después de su publicación.
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Contacto</h2>
          <p className="mb-4 leading-relaxed">
            Para solicitudes de anulación, modificación o consultas sobre estas
            políticas, puede comunicarse con:
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
