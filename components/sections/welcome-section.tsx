import { Fraunces } from "next/font/google";
import styles from "./welcome-section.module.css";

const fraunces = Fraunces({ subsets: ["latin"] });

export function WelcomeSection() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col sm:flex-row w-full">
        <div className={styles.pWelcome}>
          <h2 className={`${fraunces.className} text-3xl text-[#162F40]`}>
            ¡Bienvenido a Recovery Care Solutions!
          </h2>
        </div>
        <div>
          <p className="text-[#162F40]">
            Ofrecemos soluciones de cuidado de la salud y belleza, conectando
            las necesidades de los pacientes con casas de recuperación en todo
            el mundo. Nuestros servicios incluyen estadías para pacientes que se
            están recuperando de cirugías plásticas, cirugías bariátricas,
            implantes de cabello, salud mental y rehabilitación.
          </p>
        </div>
      </div>
    </div>
  );
}
