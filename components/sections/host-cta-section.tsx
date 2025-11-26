import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

type HostCTASectionProps = {
  lang?: "es" | "en";
};

export function HostCTASection({ lang = "es" }: HostCTASectionProps) {
  const isSpanish = lang === "es";

  return (
    <section className="container mx-auto mt-16 p-8 rounded-3xl relative h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/cta/0.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      <Image
        src="/assets/cta/1.jpg"
        alt="Background mobile"
        fill
        className="object-cover md:hidden"
        priority
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center max-w-lg">
        <h2
          className={`${fraunces.className} text-4xl md:text-5xl text-white mb-4`}
        >
          {isSpanish
            ? "Tu espacio vale la pena compartirlo"
            : "Your space is worth sharing"}
        </h2>

        <p className="text-lg text-white/90 mb-8">
          {isSpanish
            ? "Convierte tu casa en tu próxima oportunidad"
            : "Turn your home into your next opportunity"}
        </p>

        <Link href="/registro">
          <Button
            className="bg-white text-[#162F40] hover:bg-white/90 w-fit"
            size="lg"
          >
            {isSpanish ? "Conviértete en Host" : "Become a Host"}
          </Button>
        </Link>
      </div>
    </section>
  );
}
