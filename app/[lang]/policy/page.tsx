"use client";

import { useMemo } from "react";
import { Mail, Globe } from "lucide-react";
import { type Locale } from "@/lib/i18n"; 
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

export default function TermsAndConditionsPage() {
  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Default to 'es'
  const isSpanish = lang === "es";

  // Determinar la locale para date-fns
  const dateFnsLocale = useMemo(() => isSpanish ? es : enUS, [isSpanish]);
  
  // Formato de fecha localizado para el footer
  const formattedDate = format(new Date(), "d LLLL yyyy", { locale: dateFnsLocale });


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {isSpanish ? "Términos y Condiciones de Uso" : "Terms and Conditions of Use"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isSpanish ? "Plataforma Recovery Care Solutions" : "Recovery Care Solutions Platform"}
          </p>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "1. Aceptación de los Términos" : "1. Acceptance of Terms"}
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              {isSpanish
                ? "El uso de la plataforma Recovery Care Solutions (en adelante, la Plataforma) implica la aceptación plena y sin reservas de los presentes Términos y Condiciones de Uso."
                : "The use of the Recovery Care Solutions platform (hereinafter, the Platform) implies the full and unreserved acceptance of these Terms and Conditions of Use."}
            </p>
            <p className="leading-relaxed">
              {isSpanish
                ? "Toda persona que acceda, navegue, se registre o utilice los servicios ofrecidos declara haber leído, comprendido y aceptado estos términos."
                : "Any person who accesses, navigates, registers, or uses the offered services declares to have read, understood, and accepted these terms."}
            </p>
            <p className="leading-relaxed">
              {isSpanish
                ? "En caso de no estar de acuerdo con alguna de las condiciones aquí establecidas, se recomienda no utilizar la Plataforma."
                : "If you do not agree with any of the conditions established herein, it is recommended not to use the Platform."}
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "2. Objeto de la Plataforma" : "2. Platform Purpose"}
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              {isSpanish
                ? "Recovery Care Solutions es una plataforma digital que facilita la gestión de reservas de alojamiento temporal, asistencia y servicios complementarios orientados a personas que requieren estadías de recuperación, acompañamiento o atención personalizada."
                : "Recovery Care Solutions is a digital platform that facilitates the management of temporary accommodation bookings, assistance, and complementary services aimed at people requiring recovery stays, companionship, or personalized care."}
            </p>
            <p className="leading-relaxed">
              {isSpanish
                ? "La Plataforma actúa como intermediario tecnológico entre los usuarios (huéspedes, familiares o acompañantes) y los prestadores de servicios (propietarios, coordinadores o establecimientos asociados)."
                : "The Platform acts as a technological intermediary between users (guests, family members, or companions) and service providers (owners, coordinators, or associated establishments)."}
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "3. Registro de Usuarios" : "3. User Registration"}
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              {isSpanish
                ? "Para acceder a los servicios de la Plataforma, el usuario deberá crear una cuenta personal proporcionando información veraz, completa y actualizada."
                : "To access the Platform's services, the user must create a personal account by providing truthful, complete, and updated information."}
            </p>
            <p className="leading-relaxed">
              {isSpanish
                ? "El usuario se compromete a mantener la confidencialidad de sus credenciales de acceso y será responsable por toda actividad realizada desde su cuenta."
                : "The user commits to maintaining the confidentiality of their access credentials and will be responsible for all activity carried out from their account."}
            </p>
            <p className="leading-relaxed">
              {isSpanish
                ? "Recovery Care Solutions no será responsable de los daños o perjuicios derivados del uso indebido de las credenciales de acceso ni de la falsedad de los datos proporcionados."
                : "Recovery Care Solutions will not be responsible for damages or losses derived from the improper use of access credentials or the falsity of the provided data."}
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "4. Definición y Alcance" : "4. Definition and Scope"}
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed">
              {isSpanish
                ? "Estos Términos y Condiciones regulan las políticas de anulación y modificación de reservas realizadas a través de la plataforma Recovery Care Solutions."
                : "These Terms and Conditions regulate the policies for cancellation and modification of bookings made through the Recovery Care Solutions platform."}
            </p>
            <p className="leading-relaxed">
              {isSpanish
                ? "Toda reserva confirmada implica la aceptación expresa de estas condiciones por parte del usuario."
                : "Any confirmed booking implies the express acceptance of these conditions by the user."}
            </p>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "5. Políticas de Anulación de Reserva" : "5. Booking Cancellation Policies"}
          </h2>
          <div className="space-y-6">
            {/* 5.1 Definición */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                {isSpanish ? "5.1. Definición" : "5.1. Definition"}
              </h3>
              <p className="leading-relaxed">
                {isSpanish
                  ? "La anulación de reserva se refiere al proceso mediante el cual el usuario cancela una reserva confirmada antes del inicio de la estadía. Estas políticas establecen los plazos, condiciones y posibles reembolsos según el tipo de estadía y el momento en que se solicita la anulación."
                  : "Booking cancellation refers to the process by which the user cancels a confirmed booking before the start of the stay. These policies establish the deadlines, conditions, and possible refunds according to the type of stay and the moment the cancellation is requested."}
              </p>
            </div>

            {/* 5.2 Objeciones a las políticas de reserva */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                {isSpanish ? "5.2. Objeciones a las políticas de reserva " : "5.2. Objections to Booking Policies "}
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                {isSpanish
                  ? "Estas serían políticas que harían que se les reembolse a los huéspedes independiente de la política establecida por el anfitrión y que a su vez le darían libertad al anfitrión de cancelar la reserva del huésped sobre el tiempo. En cualquier caso aplican cuando ocurran en la ciudad de destino."
                  : "These policies would grant refunds to guests regardless of the host's established policy and would also give the host freedom to cancel the guest's reservation over time. In any case, they apply when they occur in the destination city."}
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Desastres naturales que impidan llegar al Hospedaje o que estén afectando el destino, no la procedencia."
                    : "Natural disasters that prevent arrival at the Accommodation or that are affecting the destination, not the origin."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Pandemias o Epidemias explícitamente declaradas por los organismos gubernamentales de salud publica de la locación de destino."
                    : "Pandemics or Epidemics explicitly declared by the governmental public health agencies of the destination location."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Mítines, guerras civiles o militares en la ciudad de destino."
                    : "Rallies, civil or military wars in the destination city."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Si se presenta un inconveniente a la llegada que el anfitrión no puede resolver en máximo 5 horas"
                    : "If a problem arises upon arrival that the host cannot resolve within a maximum of 5 hours"}
                </li>
              </ul>
            </div>

            {/* 5.3 Condiciones según tipo de estadía */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {isSpanish ? "5.3. Condiciones según el tipo de estadía" : "5.3. Conditions according to the type of stay"}
              </h3>

              {/* Estadía Corta */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  {isSpanish ? "a. Estadía Corta (1 a 5 noches)" : "a. Short Stay (1 to 5 nights)"}
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish
                        ? "Dentro de las primeras 24 horas posteriores a la reserva:"
                        : "Within the first 24 hours after booking:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ Anulación gratuita con devolución del 100% del monto pagado."
                        : "→ Free cancellation with 100% refund of the amount paid."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish
                        ? "Después de 24 horas:"
                        : "After 24 hours:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ No hay reembolso. Se retiene el anticipo y cualquier saldo pagado."
                        : "→ No refund. The prepayment and any balance paid are retained."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadía Media */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  {isSpanish ? "b. Estadía Media (6 a 9 noches)" : "b. Medium Stay (6 to 9 nights)"}
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish
                        ? "Dentro de las primeras 24 horas posteriores a la reserva:"
                        : "Within the first 24 hours after booking:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ Anulación gratuita con devolución del 100% del monto pagado."
                        : "→ Free cancellation with 100% refund of the amount paid."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish
                        ? "Después de 24 horas:"
                        : "After 24 hours:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ No hay reembolso. Se retiene el anticipo y cualquier saldo pagado."
                        : "→ No refund. The prepayment and any balance paid are retained."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadía Larga */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  {isSpanish ? "c. Estadía Larga (10 o más noches)" : "c. Long Stay (10 or more nights)"}
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish
                        ? "Dentro de las primeras 24 horas posteriores a la reserva:"
                        : "Within the first 24 hours after booking:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ Anulación gratuita con devolución del 100% del monto pagado."
                        : "→ Free cancellation with 100% refund of the amount paid."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish
                        ? "Entre las 24 horas y los 15 días desde la reserva:"
                        : "Between 24 hours and 15 days from booking:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ Devolución del 50% del monto pagado."
                        : "→ 50% refund of the amount paid."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish
                        ? "Después de 15 días desde la reserva:"
                        : "After 15 days from booking:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ Se devuelve el monto total menos el anticipo, el cual se retiene como penalización."
                        : "→ The total amount minus the prepayment is refunded, which is retained as a penalty."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish
                        ? "Si el pago del saldo no se completa 72 horas antes del check-in:"
                        : "If the balance payment is not completed 72 hours before check-in:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ El anticipo se pierde en su totalidad como penalización."
                        : "→ The prepayment is entirely forfeited as a penalty."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5.4 Condiciones Generales */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                {isSpanish ? "5.4. Condiciones Generales de Anulación" : "5.4. General Cancellation Conditions"}
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Las anulaciones deben realizarse exclusivamente a través de la plataforma."
                    : "Cancellations must be made exclusively through the platform."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Los reembolsos aplicables se procesarán en un plazo máximo de 10 días hábiles, utilizando el mismo medio de pago empleado por el usuario."
                    : "Applicable refunds will be processed within a maximum period of 10 business days, using the same payment method employed by the user."}
                </li>
                <li className="leading-relaxed">
                  {isSpanish
                    ? "Recovery Care Solutions se reserva el derecho de revisar las solicitudes de anulación en casos excepcionales debidamente justificados (por ejemplo, causas médicas documentadas)."
                    : "Recovery Care Solutions reserves the right to review cancellation requests in exceptional, duly justified cases (e.g., documented medical reasons)."}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "6. Formas de Pago" : "6. Payment Methods"}
          </h2>
          <div className="space-y-6">
            <p className="leading-relaxed">
              {isSpanish
                ? "Recovery Care Solutions ofrece dos modalidades de pago para adaptarse a las necesidades de cada huésped:"
                : "Recovery Care Solutions offers two payment modalities to adapt to the needs of each guest:"}
            </p>

            {/* 6.1 Pago Total */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">
                {isSpanish ? "6.1. Pago Total" : "6.1. Full Payment"}
              </h3>
              <p className="leading-relaxed">
                {isSpanish
                  ? "El huésped puede abonar el 100% del monto total al momento de realizar la reserva, asegurando de inmediato su estadía sin necesidad de pagos posteriores."
                  : "The guest can pay 100% of the total amount at the time of booking, immediately securing their stay without the need for subsequent payments."}
              </p>
            </div>

            {/* 6.2 Pago con Anticipo */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">
                {isSpanish ? "6.2. Pago con Anticipo (10%)" : "6.2. Prepayment (10%)"}
              </h3>
              <p className="leading-relaxed mb-4">
                {isSpanish
                  ? "Se permite al huésped pagar un anticipo equivalente al 10% del total para asegurar la reserva y completar el pago restante en una fecha posterior."
                  : "The guest is allowed to pay a prepayment equivalent to 10% of the total to secure the booking and complete the remaining payment at a later date."}
              </p>
              <div className="space-y-3 pl-4">
                <div>
                  <p className="font-medium mb-1">
                    {isSpanish ? "Condiciones del anticipo:" : "Prepayment conditions:"}
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                    <li>
                      {isSpanish
                        ? "La reserva con anticipo incluye anulación gratuita durante las primeras 24 horas posteriores a la confirmación."
                        : "The prepayment booking includes free cancellation within the first 24 hours after confirmation."}
                    </li>
                    <li>
                      {isSpanish
                        ? "Para estadías largas (+10 noches), el anticipo puede ser reembolsable bajo ciertas condiciones, según las políticas detalladas de cancelación vigentes en Recovery Care Solutions."
                        : "For long stays (+10 nights), the prepayment may be refundable under certain conditions, according to the detailed cancellation policies in force at Recovery Care Solutions."}
                    </li>
                    <li>
                      {isSpanish
                        ? "Si el pago total no se completa 72 horas antes del check-in, la reserva puede ser anulada y el anticipo retenido como penalización."
                        : "If the full payment is not completed 72 hours before check-in, the booking may be canceled and the prepayment retained as a penalty."}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "7. Políticas de Modificación de Reserva" : "7. Booking Modification Policies"}
          </h2>
          <div className="space-y-6">
            {/* 7.1 Definición */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                {isSpanish ? "7.1. Definición" : "7.1. Definition"}
              </h3>
              <p className="leading-relaxed">
                {isSpanish
                  ? "La modificación de reserva permite al usuario realizar cambios en una reserva confirmada, tales como fechas de estadía, número de huéspedes u otros detalles relevantes. Las condiciones dependen del tipo de estadía y del tiempo restante antes del check-in."
                  : "Booking modification allows the user to make changes to a confirmed booking, such as stay dates, number of guests, or other relevant details. Conditions depend on the type of stay and the time remaining before check-in."}
              </p>
            </div>

            {/* 7.2 Condiciones según tipo de estadía */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {isSpanish ? "7.2. Condiciones según el tipo de estadía" : "7.2. Conditions according to the type of stay"}
              </h3>

              {/* Estadías Cortas y Medias */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  {isSpanish ? "a. Estadías Cortas y Medias (1 a 9 noches)" : "a. Short and Medium Stays (1 to 9 nights)"}
                </h4>
                <div className="space-y-2">
                  <p className="font-medium">
                    {isSpanish ? "Modificaciones: No permitidas bajo ninguna circunstancia." : "Modifications: Not permitted under any circumstances."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish
                      ? "En caso de necesitar cambios, el usuario deberá anular la reserva bajo las condiciones establecidas en la sección de Anulación de Reserva y efectuar una nueva reserva."
                      : "If changes are needed, the user must cancel the booking under the conditions established in the Cancellation Policy section and make a new booking."}
                  </p>
                </div>
              </div>

              {/* Estadías Largas */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  {isSpanish ? "b. Estadías Largas (10 o más noches)" : "b. Long Stays (10 or more nights)"}
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish ? "Modificaciones permitidas:" : "Permitted modifications:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ Se permite una (1) modificación gratuita por reserva, que puede incluir cambio de fechas y otros detalles relacionados."
                        : "→ One (1) free modification per booking is allowed, which may include changing dates and other related details."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish ? "Plazos para modificar:" : "Deadlines for modification:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish ? "→ Hasta 6 meses antes del check-in, o" : "→ Up to 6 months before check-in, or"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ Hasta 72 horas antes del check-in para reservas con menos de 6 meses de anticipación."
                        : "→ Up to 72 hours before check-in for bookings made with less than 6 months advance notice."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {isSpanish ? "Ajuste de precios:" : "Price adjustment:"}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ En caso de que las fechas modificadas alteren la tarifa vigente, la diferencia será sumada o restada al saldo pendiente."
                        : "→ If the modified dates alter the current rate, the difference will be added to or subtracted from the pending balance."}
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      {isSpanish
                        ? "→ Si el cambio genera un monto a favor del usuario, este podrá ser utilizado en futuras reservas o reembolsado según las políticas de devolución vigentes."
                        : "→ If the change generates an amount in favor of the user, this can be used in future bookings or refunded according to the current refund policies."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "8. Consideraciones Adicionales" : "8. Additional Considerations"}
          </h2>
          <ul className="space-y-3 list-disc list-inside">
            <li className="leading-relaxed">
              {isSpanish
                ? "Cualquier solicitud fuera de los plazos establecidos será considerada no válida y no generará derecho a reembolso o modificación."
                : "Any request outside the established deadlines will be considered invalid and will not generate the right to a refund or modification."}
            </li>
            <li className="leading-relaxed">
              {isSpanish
                ? "Recovery Care Solutions no se hace responsable por gastos adicionales o perjuicios indirectos derivados de una anulación o modificación (por ejemplo, transporte, servicios externos, etc.)."
                : "Recovery Care Solutions is not responsible for additional expenses or indirect damages resulting from a cancellation or modification (e.g., transportation, external services, etc.)."}
            </li>
            <li className="leading-relaxed">
              {isSpanish
                ? "La empresa podrá realizar ajustes o actualizaciones a estas políticas en cualquier momento, los cuales se aplicarán a las nuevas reservas efectuadas después de su publicación."
                : "The company may make adjustments or updates to these policies at any time, which will apply to new bookings made after their publication."}
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {isSpanish ? "9. Contacto" : "9. Contact"}
          </h2>
          <p className="mb-4 leading-relaxed">
            {isSpanish
              ? "Para solicitudes de anulación, modificación o consultas sobre estas políticas, puede comunicarse con:"
              : "For cancellation, modification requests, or inquiries about these policies, you can contact:"}
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <a
                href="mailto:soporte@recoverycaresolutions.com"
                className="text-primary hover:underline"
              >
                manager@recoverycaresolutions.com
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
            {isSpanish ? "Última actualización: " : "Last updated: "}
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}