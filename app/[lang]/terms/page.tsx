"use client";

import { type Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

export default function TermsAndConditionsPage() {
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  const isSpanish = lang === "es";

  return (
    <div className="min-h-screen bg-[#F8F8F7] text-[#162F40]">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12 border-b border-gray-200 pb-8">
          <h1 className={`${fraunces.className} text-2xl md:text-4xl font-normal mb-3 text-[#162F40]`}>
            {isSpanish ? "Condiciones Generales de Uso" : "General Terms of Use"}
          </h1>
          <h3 className={`${fraunces.className} text-[16px] md:text-xl font-normal text-[#39759E]`}>
            www.recoverycaresolutions.com
          </h3>
        </div>

        <div className="prose prose-neutral max-w-none text-gray-700">
          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "Introducción" : "Introduction"}
            </h2>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Las presentes Condiciones regulan el uso de esta Aplicación, y, cualquier otro Contrato o relación jurídica conexos celebrados con el Titular de forma jurídicamente vinculante. Las palabras en mayúsculas se definen en la sección correspondiente específica del presente documento."
                : "These Terms govern the use of this Application and any other contract or legally binding relationship concluded with the Owner. Capitalized words are defined in the relevant specific section of this document."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Los Usuarios deben leer atentamente el presente documento."
                : "Users must read this document carefully."}
            </p>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 leading-relaxed mb-4">
              {isSpanish ? (
                <>
                  <strong className="text-[#162F40]">Esta Aplicación es ofrecida por:</strong>
                  <br />
                  Recovery Care Solutions
                  <br />
                  14331 SW 120th St #101, Miami, FL 33186
                  <br />
                  <strong className="text-[#162F40]">Correo electrónico de contacto del Titular:</strong>{" "}
                  <a href="mailto:manager@recoverycaresolutions.com" className="text-[#39759E] hover:underline">
                    manager@recoverycaresolutions.com
                  </a>
                </>
              ) : (
                <>
                  <strong className="text-[#162F40]">This Application is provided by:</strong>
                  <br />
                  Recovery Care Solutions
                  <br />
                  14331 SW 120th St #101, Miami, FL 33186
                  <br />
                  <strong className="text-[#162F40]">Owner contact email:</strong>{" "}
                  <a href="mailto:manager@recoverycaresolutions.com" className="text-[#39759E] hover:underline">
                    manager@recoverycaresolutions.com
                  </a>
                </>
              )}
            </div>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish
                ? "Lo que el Usuario debería saber de un vistazo"
                : "What Users Should Know at a Glance"}
            </h2>

            <p className="leading-relaxed mb-4">
              {isSpanish ? (
                <strong className="text-[#162F40]">
                  La utilización de esta Aplicación y del Servicio está restringida en función de la edad
                </strong>
              ) : (
                <strong className="text-[#162F40]">
                  The use of this Application and the Service is age-restricted
                </strong>
              )}
              {isSpanish
                ? ": para acceder a esta Aplicación y a sus Servicios y utilizarlos es preciso ser mayor de edad según la ley aplicable."
                : ": to access and use this Application and its Services, you must be of legal age according to applicable law."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Por favor tenga en cuenta que algunas disposiciones de las presentes Condiciones solo son aplicables a determinadas categorías de Usuarios. En particular, ciertas disposiciones solo serán de aplicación a los Consumidores o a aquellos Usuarios que no entren en la categoría de Consumidores. Tales limitaciones se mencionan siempre de forma expresa en cada una de las cláusulas a las que se refieren. En ausencia de una mención de este tipo, las cláusulas serán aplicables a todos los Usuarios."
                : "Please note that some provisions of these Terms only apply to certain categories of Users. In particular, certain provisions will only apply to Consumers or to Users who are not Consumers. Such limitations are always explicitly mentioned in each clause to which they refer. In the absence of such a mention, the clauses will apply to all Users."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "CONDICIONES DE USO" : "TERMS OF USE"}
            </h2>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Salvo que se establezca lo contrario, las condiciones de uso detalladas en esta sección se aplicarán de forma general al uso de esta Aplicación."
                : "Unless otherwise stated, the terms of use detailed in this section will generally apply to the use of this Application."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "En situaciones concretas pueden aplicarse condiciones de uso o de acceso individuales o adicionales y en tales supuestos se indicarán de forma adicional en el presente documento."
                : "In specific situations, individual or additional terms of use or access may apply, and in such cases, they will be indicated additionally in this document."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Al utilizar esta Aplicación, los Usuarios confirman que cumplen los siguientes requisitos:"
                : "By using this Application, Users confirm that they meet the following requirements:"}
            </p>

            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>
                {isSpanish
                  ? "No existen restricciones referidas a los Usuarios en el sentido de que estos sean Consumidores o Usuarios Profesionales;"
                  : "There are no restrictions on Users in terms of whether they are Consumers or Professional Users;"}
              </li>
              <li>
                {isSpanish
                  ? "Los Usuarios deberán ser mayores de edad con arreglo a la ley aplicable;"
                  : "Users must be of legal age according to applicable law;"}
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish
                ? "Contenido en esta Aplicación"
                : "Content in this Application"}
            </h2>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Salvo que se especifique lo contrario o se pueda reconocer de forma clara, todos los contenidos disponibles en esta Aplicación son propiedad del Titular o son proporcionados por este o sus licenciantes."
                : "Unless otherwise specified or clearly recognizable, all content available on this Application is owned by the Owner or provided by them or their licensors."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "El Titular se compromete a actuar con la máxima diligencia para velar por que los contenidos proporcionados en esta Aplicación no infrinjan ninguna disposición legal ni vulneren los derechos de terceros. Sin embargo, no siempre será posible conseguir dicho objetivo. En tales supuestos, sin perjuicio de las prerrogativas legales de que dispongan los Usuarios para hacer cumplir sus derechos, se ruega a los Usuarios que comuniquen las quejas en este sentido utilizando los datos de contacto facilitados en el presente documento."
                : "The Owner commits to act with the utmost diligence to ensure that the content provided on this Application does not violate any legal provision or infringe the rights of third parties. However, achieving this goal may not always be possible. In such cases, without prejudice to the legal rights of Users to enforce their rights, Users are requested to report complaints using the contact information provided in this document."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Derechos relativos a los contenidos en esta Aplicación"
                : "Rights Regarding Content on this Application"}
            </h3>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "El Titular se reserva todos los derechos de propiedad intelectual sobre la totalidad de dichos contenidos."
                : "The Owner reserves all intellectual property rights over all such content."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Por consiguiente, los Usuarios no podrán utilizar esos contenidos de formas que no sean necesarias o estén implícitas en el uso adecuado del Servicio."
                : "Consequently, Users may not use such content in ways that are unnecessary or not implied by the proper use of the Service."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "En particular, pero sin limitaciones, los Usuarios no podrán copiar, descargar, compartir (más allá de los límites establecidos más adelante), modificar, traducir, transformar, publicar, transmitir, vender, sublicenciar, editar, transferir/ceder a terceros o crear obras derivadas de los contenidos disponibles en esta Aplicación, ni permitir a ningún tercero hacerlo a través del Usuario o de su dispositivo, incluso sin el conocimiento del Usuario."
                : "In particular, without limitation, Users may not copy, download, share (beyond the limits set below), modify, translate, transform, publish, transmit, sell, sublicense, edit, transfer/assign to third parties, or create derivative works from the content available on this Application, nor allow any third party to do so through the User or their device, even without the User's knowledge."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "En los casos en que se establezca de forma expresa en esta Aplicación, el Usuario podrá descargar, copiar y/o compartir cualquier contenido disponible a través de esta Aplicación únicamente para su uso personal y no comercial y siempre y cuando se efectúen correctamente los reconocimientos de derechos de autor y todos los demás reconocimientos solicitados por el Titular."
                : "In cases where explicitly stated on this Application, the User may download, copy, and/or share any content available through this Application solely for personal, non-commercial use, provided that proper copyright attribution and all other acknowledgments required by the Owner are made."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Las limitaciones o excepciones de los derechos de autor establecidas por ley no se verán afectadas."
                : "Copyright limitations or exceptions established by law remain unaffected."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish
                ? "Acceso a recursos externos"
                : "Access to External Resources"}
            </h2>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "A través de esta Aplicación los Usuarios podrán acceder a recursos externos proporcionados por terceros. Los Usuarios reconocen y aceptan que el Titular no tiene ningún control sobre dichos recursos y que, por tanto, no es responsable de sus contenidos y disponibilidad."
                : "Through this Application, Users may access external resources provided by third parties. Users acknowledge and agree that the Owner has no control over such resources and, therefore, is not responsible for their content or availability."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Las condiciones aplicables a los recursos proporcionados por terceros, incluyendo las aplicables a cualquier posible concesión de derechos sobre el contenido, se derivan de los términos y condiciones de dichos terceros o, a falta de estos, de las leyes aplicables."
                : "The terms applicable to resources provided by third parties, including any potential granting of rights over the content, derive from the terms and conditions of such third parties or, in their absence, from applicable law."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "Usos aceptables" : "Acceptable Uses"}
            </h2>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Esta Aplicación y el Servicio solo podrán utilizarse dentro del ámbito para el cual se proporcionan, con arreglo a las presentes Condiciones y a la legislación aplicable."
                : "This Application and the Service may only be used within the scope for which they are provided, in accordance with these Terms and applicable law."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Los Usuarios serán los únicos responsables de asegurarse de que su utilización de esta Aplicación y/o del Servicio no infringe ninguna ley o reglamento ni vulnera derechos de terceros."
                : "Users are solely responsible for ensuring that their use of this Application and/or the Service does not violate any law or regulation or infringe the rights of third parties."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Por consiguiente, el Titular se reserva el derecho a adoptar las medidas oportunas para proteger sus intereses legítimos, incluyendo denegar a los Usuarios el acceso a esta Aplicación o al Servicio, resolver contratos, denunciar conductas inadecuadas llevadas a cabo a través de esta Aplicación o del Servicio a las autoridades competentes - tales como las autoridades judiciales o administrativas - siempre que los Usuarios realicen o se sospechen que han realizado cualquiera de las siguientes actividades:"
                : "Accordingly, the Owner reserves the right to take appropriate measures to protect its legitimate interests, including denying Users access to this Application or the Service, terminating contracts, reporting inappropriate conduct carried out through this Application or the Service to competent authorities—such as judicial or administrative authorities—whenever Users engage in or are suspected of engaging in any of the following activities:"}
            </p>

            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>
                {isSpanish
                  ? "Infracciones de las leyes, los reglamentos y/o de las presentes Condiciones;"
                  : "Violations of laws, regulations, and/or these Terms;"}
              </li>
              <li>
                {isSpanish
                  ? "Vulneración de los derechos de terceros;"
                  : "Infringement of third-party rights;"}
              </li>
              <li>
                {isSpanish
                  ? "Causar un perjuicio considerable a los intereses legítimos del Titular;"
                  : "Causing significant harm to the Owner's legitimate interests;"}
              </li>
              <li>
                {isSpanish
                  ? "Ofender al Titular o a algún tercero."
                  : "Offending the Owner or any third party."}
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish
                ? "Responsabilidad y exención de responsabilidad"
                : "Liability and Disclaimer"}
            </h2>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Salvo que se establezca o acuerde con los Usuarios lo contrario de forma expresa, se excluye, limita y/o reduce la responsabilidad del Titular por los daños y perjuicios relativos a la ejecución del Contrato hasta el máximo permitido por la ley aplicable."
                : "Unless expressly stated or agreed otherwise with Users, the Owner's liability for damages related to the performance of the Contract is excluded, limited, and/or reduced to the maximum extent permitted by applicable law."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish ? "Exención de responsabilidad" : "Disclaimer"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "El Usuario acuerda indemnizar y eximir de toda responsabilidad al Titular y a sus filiales, sociedades afiliadas, directivos, administradores, agentes, cotitulares de marcas, socios y empleados frente a cualquier reclamación o demanda - incluyendo, con carácter enunciativo y no limitativo, los honorarios de abogados y las costas - formuladas por cualquier tercero debido a o en relación con una violación negligente de las presentes Condiciones, los derechos de terceros o las disposiciones establecidas por ley relacionadas con el uso del Servicio por parte del Usuario o de sus sociedades afiliadas, directivos, administradores, agentes, cotitulares de marcas, socios y empleados hasta la máxima extensión permitida por la ley aplicable."
                : "The User agrees to indemnify and hold harmless the Owner and its subsidiaries, affiliated companies, officers, directors, agents, co-owners of trademarks, partners, and employees from any claim or demand—including, by way of example and not limitation, attorneys’ fees and costs—made by any third party due to or in connection with negligent violation of these Terms, third-party rights, or legal provisions related to the User’s use of the Service or that of its affiliates, officers, directors, agents, co-owners of trademarks, partners, and employees, to the maximum extent permitted by applicable law."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Lo anterior también se aplica a cualquier reclamación presentada por terceros (incluyendo, con carácter enunciativo y no limitativo, los clientes o consumidores del Titular) contra el Titular relativas a Productos Digitales suministrados por el Usuario como, por ejemplo, las reclamaciones relativas a la conformidad."
                : "The above also applies to any claims made by third parties (including, by way of example and not limitation, the Owner’s customers or consumers) against the Owner regarding Digital Products supplied by the User, such as claims relating to conformity."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Limitación de responsabilidad"
                : "Limitation of Liability"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Salvo que se establezca expresamente lo contrario y sin perjuicio de la ley aplicable, el Usuario no podrá reclamar daños y perjuicios contra el Titular (ni contra ninguna persona física o jurídica que actúe en su nombre)."
                : "Unless expressly stated otherwise and without prejudice to applicable law, the User may not claim damages against the Owner (nor against any natural or legal person acting on its behalf)."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Lo anterior no será aplicable a los daños que afecten a la vida, la salud o la integridad física, los daños y perjuicios resultantes del incumplimiento de las obligaciones contractuales sustantivas, como cualquier obligación que sea estrictamente necesaria para lograr el objetivo del contrato, y/o a los daños y perjuicios resultantes del dolo o la negligencia grave, siempre y cuando el Usuario haya utilizado esta Aplicación de forma apropiada y correcta."
                : "The above does not apply to damages affecting life, health, or physical integrity, damages resulting from the breach of substantive contractual obligations, such as any obligation strictly necessary to achieve the purpose of the contract, and/or damages resulting from willful misconduct or gross negligence, provided the User has used this Application appropriately and correctly."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Salvo que los daños hayan sido causados mediante dolo o negligencia grave, o que afecten a la vida, la salud o la integridad física, el Titular solo será responsable en la medida de los daños que fueran típicos y previsibles en el momento en el que se celebró el contrato."
                : "Unless the damages were caused by willful misconduct or gross negligence, or affect life, health, or physical integrity, the Owner shall only be liable for damages that were typical and foreseeable at the time the contract was concluded."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "Usuarios australianos" : "Australian Users"}
            </h2>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Limitación de responsabilidad"
                : "Limitation of Liability"}
            </h3>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Ninguna de las disposiciones de las presentes Condiciones excluye, limita o modifica ninguna de las garantías, condiciones, derechos o recursos de que disponga el Usuario con arreglo a la Competition and Consumer Act 2010 (Ley sobre Competencia y Consumidores de 2010, en lo sucesivo «Cth») o cualquier otra normativa de un estado o territorio y que no pueda excluirse, limitarse o modificarse (derecho no excluible). En la máxima medida de lo permitido por la ley, nuestra responsabilidad ante el Usuario, incluyendo la responsabilidad por la vulneración de un derecho no excluible y la responsabilidad que no se haya excluido de cualquier otra forma en las presentes Condiciones, está limitada, a la exclusiva discreción del Titular, a la repetición de la prestación de los servicios o al pago del coste de que se presten de nuevo los servicios."
                : "None of the provisions of these Terms exclude, limit, or modify any warranties, conditions, rights, or remedies available to the User under the Competition and Consumer Act 2010 (Cth) or any other state or territory law that cannot be excluded, limited, or modified (non-excludable right). To the maximum extent permitted by law, our liability to the User, including liability for breach of a non-excludable right and liability not otherwise excluded under these Terms, is limited, at the sole discretion of the Owner, to the re-supply of the services or payment of the cost of having the services supplied again."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "Usuarios de EE.UU." : "U.S. Users"}
            </h2>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Exclusión de garantías"
                : "Disclaimer of Warranties"}
            </h3>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Esta Aplicación se proporciona estrictamente en el estado y en las condiciones en las que se ofrece y tal como está disponible. La utilización del Servicio será bajo la propia responsabilidad de los Usuarios. En la medida de lo legalmente posible, el Titular excluye expresamente todas las condiciones, declaraciones y garantías — ya sean expresas, implícitas, establecidas por la ley o de cualquier otro tipo, incluyendo, con carácter enunciativo y no limitativo, cualquier garantía implícita de comercialización, idoneidad para un fin determinado o no vulneración de derechos de terceros. Ningún asesoramiento o información, ya sea en forma oral o escrita, obtenidos por el Usuario del Titular o a través del Servicio dará lugar a ninguna garantía que no se haya establecido expresamente en las presentes Condiciones."
                : "This Application is provided strictly as is and as available. Use of the Service is at the Users' own risk. To the extent legally possible, the Owner expressly disclaims all conditions, statements, and warranties—whether express, implied, statutory, or of any other kind, including, without limitation, any implied warranties of merchantability, fitness for a particular purpose, or non-infringement. No advice or information, whether oral or written, obtained by the User from the Owner or through the Service shall create any warranty not expressly stated in these Terms."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Sin perjuicio de lo anterior, el Titular, sus filiales, sociedades afiliadas, licenciantes, directivos, administradores, agentes, cotitulares de marcas, socios, proveedores y empleados no garantizan que el contenido sea exacto, fiable o correcto; que el Servicio cumpla las exigencias de los Usuarios; que el Servicio esté disponible en un momento o lugar determinados, que no presente interrupciones ni que sea seguro; que todo defecto o error sea corregido; o que el Servicio esté libre de virus o de otros componentes dañinos. Todo contenido descargado o que se haya obtenido de cualquier otro modo mediante el uso del Servicio se descargará bajo la exclusiva responsabilidad de los Usuarios y los Usuarios serán los únicos responsables de cualquier daño que se produzca en los sistemas informáticos o dispositivos móviles de los Usuarios o de la pérdida de datos que resulte de dicha descarga o de la utilización del Servicio por parte de los Usuarios."
                : "Without limiting the foregoing, the Owner, its subsidiaries, affiliates, licensors, directors, officers, agents, co-owners of trademarks, partners, suppliers, and employees do not warrant that content is accurate, reliable, or correct; that the Service meets Users' requirements; that the Service is available at any specific time or place, uninterrupted, or secure; that all defects or errors will be corrected; or that the Service is free of viruses or other harmful components. All content downloaded or otherwise obtained through the use of the Service is at the Users' own risk, and Users are solely responsible for any damage to their computer systems or mobile devices or loss of data resulting from such download or use of the Service."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "El Titular no garantiza, respalda ni asume responsabilidad alguna respecto de ningún producto o servicio publicitado u ofrecido por un tercero a través del Servicio o de cualquier página web o servicio conectados mediante enlaces, y el Titular no será parte ni supervisará de modo alguno ninguna transacción entre los Usuarios y los terceros proveedores de productos o servicios."
                : "The Owner does not guarantee, endorse, or assume any responsibility for any product or service advertised or offered by a third party through the Service or any website or service linked thereto, and the Owner will not be a party to or oversee any transaction between Users and third-party product or service providers."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "El Servicio puede resultar inaccesible o puede no funcionar correctamente con el navegador web del Usuario, su dispositivo móvil y/o su sistema operativo. No podrá exigirse responsabilidad alguna al Titular por cualesquiera daños y perjuicios presuntos o reales derivados de los contenidos, el funcionamiento o la utilización del presente Servicio."
                : "The Service may be inaccessible or may not function properly with the User's web browser, mobile device, and/or operating system. The Owner shall not be liable for any alleged or actual damages arising from the content, operation, or use of this Service."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Las leyes federales, de algunos Estados y de otras jurisdicciones no permiten la exclusión y limitación de determinadas garantías implícitas. Es posible que las exclusiones anteriormente mencionadas no sean aplicables a los Usuarios. El presente Contrato otorga derechos legales específicos a los Usuarios y los Usuarios pueden disponer de otros derechos, que variarán de un Estado a otro. Las cláusulas de exención de responsabilidad y exclusiones en virtud del presente Contrato no serán aplicables en la medida en que estén prohibidas por la ley aplicable."
                : "Federal, state, and other jurisdictional laws do not allow the exclusion or limitation of certain implied warranties. Some of the above exclusions may not apply to Users. These Terms grant specific legal rights to Users, and Users may have other rights which vary from state to state. The disclaimers and exclusions under these Terms will not apply to the extent prohibited by applicable law."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Limitaciones de responsabilidad"
                : "Limitation of Liability"}
            </h3>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "En la máxima medida de lo permitido por la ley aplicable, en ningún caso serán responsables el Titular o sus filiales, sociedades afiliadas, directivos, administradores, agentes, cotitulares de marcas, socios, proveedores y empleados respecto de:"
                : "To the maximum extent permitted by applicable law, under no circumstances shall the Owner or its subsidiaries, affiliates, directors, officers, agents, co-owners of trademarks, partners, suppliers, and employees be liable for:"}
            </p>

            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>
                {isSpanish
                  ? "cualesquiera daños y perjuicios de carácter indirecto, punitivo, incidental, especial, emergente o ejemplar, incluyendo, con carácter enunciativo y no limitativo, daños y perjuicios por pérdida de beneficios, fondo de comercio, uso, datos u otras pérdidas intangibles, derivados del uso o incapacidad para usar el Servicio, o relacionados con dicho uso o incapacidad de usarlo; y"
                  : "any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation, damages for loss of profits, goodwill, use, data, or other intangible losses, arising from use or inability to use the Service, or related to such use or inability to use it;"}
              </li>
              <li>
                {isSpanish
                  ? "cualesquiera daños y perjuicios, pérdidas o lesiones resultantes de la piratería informática, la manipulación o cualquier otro acceso o utilización no autorizados del Servicio o de la cuenta de Usuario o de la información contenida en estos;"
                  : "any damages, losses, or injuries resulting from hacking, tampering, or any unauthorized access or use of the Service, the User account, or the information contained therein;"}
              </li>
              <li>
                {isSpanish
                  ? "cualesquiera errores, equivocaciones o inexactitudes del contenido;"
                  : "any errors, mistakes, or inaccuracies in the content;"}
              </li>
              <li>
                {isSpanish
                  ? "daños personales o materiales de cualquier naturaleza resultantes del acceso al Servicio por parte del Usuario o su utilización;"
                  : "any personal or property damages resulting from the User's access to or use of the Service;"}
              </li>
              <li>
                {isSpanish
                  ? "cualquier acceso o utilización no autorizados de los servidores seguros del Titular y/o de cualquier información personal almacenada en ellos;"
                  : "any unauthorized access to or use of the Owner’s secure servers and/or any personal information stored therein;"}
              </li>
              <li>
                {isSpanish
                  ? "cualquier interrupción o cese en la transmisión al Servicio o desde este;"
                  : "any interruption or cessation of transmission to or from the Service;"}
              </li>
              <li>
                {isSpanish
                  ? "cualesquiera errores de programación, virus, troyanos o elementos similares que puedan transmitirse al Servicio o a través de este;"
                  : "any programming errors, viruses, trojans, or similar elements that may be transmitted to or through the Service;"}
              </li>
              <li>
                {isSpanish
                  ? "cualesquiera errores u omisiones en cualquier contenido o por cualquier pérdida o daños y perjuicios que se produzcan como resultado de la utilización de cualquier contenido publicado, enviado por correo electrónico, transmitido o puesto a disposición de cualquier otra manera a través del Servicio; y/o"
                  : "any errors or omissions in any content or any loss or damages resulting from the use of any content posted, emailed, transmitted, or made available in any other way through the Service; and/or"}
              </li>
              <li>
                {isSpanish
                  ? "la conducta difamatoria, ofensiva o ilegal de cualquier Usuario o tercero."
                  : "defamatory, offensive, or illegal conduct of any User or third party."}
              </li>
            </ul>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "En ningún caso serán responsables el Titular o sus filiales, sociedades afiliadas, directivos, administradores, agentes, cotitulares de marcas, socios, proveedores o empleados por cualesquiera demandas, procedimientos, responsabilidades, obligaciones, daños y perjuicios, pérdidas o costes por un importe que exceda de la cantidad abonada por el Usuario al Titular con arreglo a las presentes Condiciones en los 12 meses anteriores, o en el plazo de duración del presente Contrato entre el Titular y el Usuario, siendo relevante el plazo más corto de los dos anteriormente mencionados."
                : "Under no circumstances shall the Owner or its subsidiaries, affiliates, directors, officers, agents, co-owners of trademarks, partners, suppliers, or employees be liable for any claims, proceedings, liabilities, obligations, damages, losses, or costs exceeding the amount paid by the User to the Owner under these Terms in the previous 12 months, or during the term of this Agreement between the Owner and the User, whichever is shorter."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Esta sección de limitación de responsabilidad será aplicable en la máxima medida de lo permitido por la ley en la jurisdicción correspondiente, con independencia de si la responsabilidad alegada es de carácter contractual, extracontractual, basada en la negligencia, en la responsabilidad objetiva o en cualquier otro supuesto, incluso si se ha advertido al Usuario de la posibilidad de tales daños y perjuicios."
                : "This limitation of liability section applies to the maximum extent permitted by law in the relevant jurisdiction, regardless of whether the alleged liability is contractual, non-contractual, based on negligence, strict liability, or any other theory, even if the User has been advised of the possibility of such damages."}
            </p>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Algunas jurisdicciones no permiten la exclusión o la limitación de los daños incidentales o emergentes y, por tanto, las limitaciones o exclusiones antes mencionadas podrían no ser aplicables al Usuario. Las presentes Condiciones otorgan al Usuario derechos legales específicos y el Usuario puede disponer también de otros derechos, que variarán dependiendo de la jurisdicción. Las cláusulas de exención de responsabilidad, exclusiones y limitaciones de responsabilidad en virtud de las presentes Condiciones no serán aplicables en la medida en que estén prohibidas por la ley aplicable."
                : "Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages; therefore, the above limitations or exclusions may not apply to the User. These Terms grant the User specific legal rights, and the User may also have other rights, which vary by jurisdiction. The disclaimers, exclusions, and limitations of liability under these Terms will not apply to the extent prohibited by applicable law."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish ? "Exención de responsabilidad" : "Indemnification"}
            </h3>

            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "El Usuario acuerda defender, eximir y liberar de toda responsabilidad al Titular y a sus filiales, sociedades afiliadas, directivos, administradores, agentes, cotitulares de marcas, socios, proveedores y empleados en relación con cualquier demanda o reclamación, daños y perjuicios, obligaciones, pérdidas, responsabilidades, costes o deudas y gastos, incluyendo, de forma enunciativa y no limitativa, gastos y costas legales, derivados de:"
                : "The User agrees to defend, indemnify, and hold harmless the Owner and its subsidiaries, affiliates, directors, officers, agents, co-owners of trademarks, partners, suppliers, and employees from any claims or demands, damages, obligations, losses, liabilities, costs, or debts and expenses, including without limitation legal fees and costs, arising from:"}
            </p>

            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>
                {isSpanish
                  ? "la utilización del Servicio por parte del Usuario o su acceso a este, incluyendo cualesquiera datos o contenidos transmitidos o recibidos por el Usuario;"
                  : "the User’s use of or access to the Service, including any data or content transmitted or received by the User;"}
              </li>
              <li>
                {isSpanish
                  ? "el incumplimiento por parte del Usuario de las presentes Condiciones, incluyendo, de forma enunciativa y no limitativa, la vulneración por parte del Usuario de cualquiera de las declaraciones y garantías establecidas en las presentes Condiciones,"
                  : "the User’s breach of these Terms, including without limitation any violation by the User of any representations and warranties set forth herein,"}
              </li>
              <li>
                {isSpanish
                  ? "la vulneración por parte del Usuario de cualesquiera derechos de terceros, incluyendo, de forma enunciativa y no limitativa, cualquier derecho a la privacidad o derechos de propiedad intelectual;"
                  : "the User’s infringement of any third-party rights, including without limitation any privacy or intellectual property rights;"}
              </li>
              <li>
                {isSpanish
                  ? "la infracción por parte del Usuario de cualquier ley, norma o reglamento;"
                  : "the User’s violation of any law, rule, or regulation;"}
              </li>
              <li>
                {isSpanish
                  ? "cualesquiera contenidos que sean publicados desde la cuenta del Usuario, incluyendo el acceso de terceros con el nombre único del Usuario, la contraseña u otras medidas de seguridad únicas del Usuario, en su caso, incluyendo, de forma enunciativa y no limitativa, la información engañosa, falsa o inexacta;"
                  : "any content posted from the User’s account, including third-party access using the User’s unique username, password, or other unique security measures, including without limitation misleading, false, or inaccurate information;"}
              </li>
              <li>
                {isSpanish
                  ? "la conducta dolosa del Usuario; o"
                  : "the User’s willful misconduct; or"}
              </li>
              <li>
                {isSpanish
                  ? "la infracción de cualquier disposición legal por parte del Usuario o de sus sociedades afiliadas, directivos, administradores, agentes, cotitulares de marcas, socios, proveedores y empleados en la máxima medida de lo permitted por la ley aplicable."
                  : "the User’s violation of any legal provision or by their affiliates, directors, officers, agents, co-owners of trademarks, partners, suppliers, and employees to the maximum extent permitted by applicable law."}
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "Disposiciones comunes" : "General Provisions"}
            </h2>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish ? "No renuncia" : "No Waiver"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "La falta de ejercicio de cualquier derecho o el hecho de no invocar una disposición en virtud de las presentes Condiciones no constituirán una renuncia a dicho derecho o dicha disposición. No se considerará que ninguna renuncia constituya a su vez una renuncia adicional o continuada a dicho término o a cualquier otro término."
                : "Failure to exercise any right or to invoke any provision under these Terms shall not constitute a waiver of such right or provision. No waiver shall constitute a further or continuing waiver of such term or any other term."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish ? "Interrupción del servicio" : "Service Interruption"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Para garantizar el mejor nivel de servicio posible, el Titular se reserva el derecho a interrumpir el Servicio para labores de mantenimiento, actualizaciones del sistema o cualesquiera otros cambios, informando adecuadamente a los Usuarios."
                : "To ensure the best possible service, the Owner reserves the right to interrupt the Service for maintenance, system updates, or any other changes, providing proper notice to Users."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Dentro de los límites de la ley, el Titular también podrá decidir suspender o dejar de prestar por completo el Servicio. Si el servicio deja de prestarse, el Titular cooperará con los Usuarios para permitirles retirar datos personales o información y respetará los derechos de los Usuarios relativos al uso continuado/la continuación en el uso del producto y/o la compensación, según establezca la ley aplicable."
                : "Within the limits of the law, the Owner may also decide to suspend or completely discontinue the Service. If the Service is discontinued, the Owner will cooperate with Users to allow them to retrieve personal data or information and will respect Users’ rights regarding continued use or compensation, as provided by applicable law."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Asimismo, el Servicio podrá no estar disponible debido a motivos fuera del control razonable del Titular, como la «fuerza mayor» (p.ej. averías en las infraestructuras o apagones, etc.)."
                : "Additionally, the Service may be unavailable due to reasons beyond the Owner's reasonable control, such as 'force majeure' (e.g., infrastructure failures or power outages, etc.)."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish ? "Reventa del Servicio" : "Resale of the Service"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Los Usuarios no reproducirán, duplicarán, copiarán, venderán, revenderán o explotarán ninguna parte de esta Aplicación y de su Servicio sin la autorización previa, expresa y por escrito del Titular, concedida ya sea directamente o a través de un programa de reventa legítimo."
                : "Users shall not reproduce, duplicate, copy, sell, resell, or exploit any part of this Application or its Service without prior express written permission from the Owner, either directly or through a legitimate resale program."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish ? "Política de privacidad" : "Privacy Policy"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Para obtener más información sobre la utilización de sus datos personales, los Usuarios podrán referirse a la política de privacidad de esta Aplicación."
                : "For more information on the use of your personal data, Users may refer to the privacy policy of this Application."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Derechos de propiedad intelectual"
                : "Intellectual Property Rights"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Sin perjuicio de cualesquiera disposiciones más específicas de las presentes Condiciones, los derechos de propiedad intelectual, tales como los derechos de autor, derechos derivados de marcas registradas, derechos de patentes y derechos de diseños relativos a esta Aplicación son propiedad exclusiva del Titular o de sus licenciantes y están protegidos por las leyes en vigor en materia de marcas y los tratados internacionales relacionados."
                : "Without prejudice to any more specific provisions in these Terms, intellectual property rights, such as copyright, trademark rights, patent rights, and design rights related to this Application are the exclusive property of the Owner or its licensors and are protected by applicable trademark laws and related international treaties."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Todas las marcas registradas - sean denominativas o gráficas - y cualesquiera otras marcas, nombres comerciales, marcas de servicio, signos denominativos, ilustraciones, imágenes o logotipos que aparezcan en relación con esta Aplicación son y seguirán siendo propiedad exclusiva del Titular o de sus licenciantes y están protegidos por las leyes en vigor en materia de marcas y los tratados internacionales relacionados."
                : "All registered trademarks—whether word or design marks—and any other trademarks, trade names, service marks, designations, illustrations, images, or logos appearing in connection with this Application are and shall remain the exclusive property of the Owner or its licensors and are protected by applicable trademark laws and related international treaties."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Cambios de las presentes Condiciones"
                : "Changes to These Terms"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "El Titular se reserva el derecho a cambiar o modificar de cualquier otro modo las presentes Condiciones en cualquier momento. En tales casos, el Titular informará adecuadamente a los Usuarios de esos cambios."
                : "The Owner reserves the right to change or otherwise modify these Terms at any time. In such cases, the Owner will provide Users with proper notice of these changes."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Dichos cambios solo afectarán a la relación con los Usuarios a partir de la fecha comunicada a los Usuarios."
                : "Such changes will only affect the relationship with Users from the date communicated to them."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "La continuidad en el uso del Servicio indicará la aceptación por parte de los Usuarios de las Condiciones modificadas. Si los Usuarios no desean quedar vinculados por estos cambios, deberán dejar de usar el Servicio y podrán resolver el Contrato."
                : "Continued use of the Service indicates Users’ acceptance of the modified Terms. If Users do not wish to be bound by these changes, they must stop using the Service and may terminate the Agreement."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "La versión aplicable previa regulará la relación antes de la aceptación del Usuario. Los Usuarios podrán obtener cualquier versión previa del Titular."
                : "The prior applicable version governs the relationship before the User’s acceptance. Users may obtain any prior version from the Owner."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Si lo exige la ley, el Titular notificará por adelantado a los Usuarios la fecha en que se harán efectivas las Condiciones modificadas."
                : "Where required by law, the Owner will provide Users with advance notice of the date on which the modified Terms will take effect."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Cesión del contrato"
                : "Assignment of the Agreement"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "El Titular se reserva el derecho a transferir, ceder, disponer mediante novación o subcontratar cualquiera de los derechos o las obligaciones establecidos con arreglo a las presentes Condiciones, teniendo en cuenta los intereses legítimos de los Usuarios."
                : "The Owner reserves the right to transfer, assign, novate, or subcontract any of the rights or obligations under these Terms, considering the legitimate interests of Users."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Las disposiciones relativas a los cambios de las presentes Condiciones se aplicarán mutatis mutandis."
                : "The provisions regarding changes to these Terms shall apply mutatis mutandis."}
            </p>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Los Usuarios no podrán ceder ni transferir sus derechos u obligaciones con arreglo a las presentes Condiciones en modo alguno, salvo con el permiso por escrito del Titular."
                : "Users may not assign or transfer their rights or obligations under these Terms in any manner, except with the Owner’s written permission."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish ? "Contacto" : "Contact"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Todas las comunicaciones relativas a la utilización de esta Aplicación deberán remitirse utilizando los datos de contacto señalados en el presente documento."
                : "All communications regarding the use of this Application should be sent using the contact details provided herein."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Posibilidad de separar una disposición"
                : "Severability"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "En el caso de que cualquier disposición de las presentes Condiciones fuera declarada o se convirtiera en inválida o inejecutable con arreglo a la ley aplicable, la invalidez o inejecutabilidad de dicha disposición no afectarán a la validez de las disposiciones restantes, que continuarán gozando de plena vigencia y efectividad."
                : "If any provision of these Terms is declared or becomes invalid or unenforceable under applicable law, the invalidity or unenforceability of that provision shall not affect the validity of the remaining provisions, which shall continue in full force and effect."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "Usuarios de EE.UU." : "U.S. Users"}
            </h2>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Cualquiera de esas disposiciones inválidas o inejecutables se interpretará y modificará en la medida en que sea razonablemente necesario para hacer que sea válida, ejecutable y coherente con la intención original. Las presentes Condiciones constituyen el Contrato completo entre los Usuarios y el Titular con respecto al objeto del presente documento y sustituyen a cualquier otra comunicación, incluyendo, con carácter enunciativo y no limitativo, todos los contratos anteriores entre las partes referidos al mismo objeto. Las presentes Condiciones se ejecutarán en la máxima medida de lo permitido por la ley."
                : "Any such invalid or unenforceable provisions shall be interpreted and amended to the extent reasonably necessary to make them valid, enforceable, and consistent with the original intent. These Terms constitute the entire Agreement between the Users and the Owner regarding the subject matter herein and supersede any other communications, including, by way of example and not limitation, all prior agreements between the parties relating to the same subject. These Terms shall be enforced to the fullest extent permitted by law."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish
                ? "Usuarios de la Unión Europea"
                : "European Union Users"}
            </h2>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "En el caso de que cualquiera de las disposiciones de las presentes Condiciones fuera nula, inválida o inejecutable, o se declarara como tal, las partes actuarán con la máxima diligencia para acordar de forma amistosa unas disposiciones válidas y ejecutables que sustituyan a las partes nulas, inválidas o inejecutables. En caso de que no se lograra llegar a dicho acuerdo, las disposiciones nulas, inválidas o inejecutables serán sustituidas por las disposiciones aplicables establecidas por la ley, si la normativa aplicable lo permite o establece de este modo. Sin perjuicio de lo anterior, la nulidad, invalidez o la imposibilidad de ejecutar una disposición concreta de las presentes Condiciones no anularán el Contrato en su conjunto, salvo que las disposiciones que sean separadas sean esenciales para el Contrato, o tengan una importancia tal que las partes no hubieran celebrado el contrato si hubieran sabido que esas disposiciones no serían válidas, o bien en supuestos en los que las disposiciones restantes darían lugar a dificultades inaceptables para cualquiera de las partes."
                : "If any provision of these Terms is found to be null, invalid, or unenforceable, or is declared as such, the parties shall act with utmost diligence to amicably agree on valid and enforceable provisions to replace the null, invalid, or unenforceable parts. If such agreement cannot be reached, the null, invalid, or unenforceable provisions shall be replaced by applicable provisions established by law, if the applicable regulations allow or provide for this. Notwithstanding the foregoing, the nullity, invalidity, or unenforceability of any particular provision of these Terms shall not invalidate the Agreement as a whole, unless the separated provisions are essential to the Agreement, or are so important that the parties would not have entered into the Agreement had they known these provisions would not be valid, or in cases where the remaining provisions would result in unacceptable difficulties for either party."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "Ley aplicable" : "Governing Law"}
            </h2>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Las presentes Condiciones se rigen por las leyes del lugar en el que tenga su sede el Titular, según lo declarado en la sección correspondiente del presente documento, sin tener en cuenta los principios sobre conflictos de leyes."
                : "These Terms are governed by the laws of the place where the Owner is headquartered, as stated in the relevant section of this document, without regard to conflict of law principles."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Primacía del Derecho nacional"
                : "Supremacy of National Law"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Sin embargo, sin perjuicio de lo anterior, si el Derecho del país en el que está situado el Usuario establece unos estándares de protección al consumidor aplicables más elevados, prevalecerán dichos estándares más elevados."
                : "However, notwithstanding the above, if the law of the country in which the User is located establishes higher applicable consumer protection standards, those higher standards shall prevail."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Excepción para los Consumidores situados en Suiza"
                : "Exception for Consumers located in Switzerland"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Si puede considerarse que el Usuario es un Consumidor situado en Suiza, será de aplicación la ley suiza."
                : "If the User qualifies as a Consumer located in Switzerland, Swiss law shall apply."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Excepción para Consumidores en Brasil"
                : "Exception for Consumers in Brazil"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Si el Usuario se califica como un Consumidor Brasileño y el producto y/o servicio se comercializa en Brasil, se aplicará la legislación brasileña."
                : "If the User qualifies as a Brazilian Consumer and the product and/or service is marketed in Brazil, Brazilian law shall apply."}
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`${fraunces.className} text-2xl font-normal mb-4 text-[#162F40]`}>
              {isSpanish ? "Fuero jurisdiccional" : "Jurisdiction"}
            </h2>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "La competencia exclusiva para resolver cualquier controversia resultante de las presentes Condiciones o relacionada con estas corresponde a los tribunales del lugar en el que se encuentre el domicilio social del Titular, como se indica en la sección correspondiente del presente documento."
                : "The exclusive jurisdiction to resolve any disputes arising from or related to these Terms lies with the courts of the location where the Owner's registered office is situated, as stated in the relevant section of this document."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Excepción para Consumidores situados en Europa"
                : "Exception for Consumers located in Europe"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Las disposiciones anteriores no serán aplicables a los Usuarios que entren en la categoría de Consumidores europeos, ni a los Consumidores residentes en el Reino Unido, Suiza, Noruega o Islandia."
                : "The above provisions shall not apply to Users who qualify as European Consumers, nor to Consumers residing in the United Kingdom, Switzerland, Norway, or Iceland."}
            </p>

            <h3 className={`${fraunces.className} text-2xl font-normal mb-3 text-[#162F40]`}>
              {isSpanish
                ? "Excepción para Consumidores en Brasil"
                : "Exception for Consumers in Brazil"}
            </h3>
            <p className="leading-relaxed mb-4">
              {isSpanish
                ? "Lo anterior no se aplica a los Usuarios en Brasil que se califiquen como Consumidores."
                : "The above does not apply to Users in Brazil who qualify as Consumers."}
            </p>
          </section>

          <section className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              <strong className="text-[#162F40] font-semibold">
                {isSpanish
                  ? "Definiciones y referencias legales"
                  : "Definitions and Legal References"}
              </strong>
              <br />
              {isSpanish
                ? "Última revisión: 25 febrero 2025"
                : "Last revision: February 25, 2025"}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}