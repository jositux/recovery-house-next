"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react"; // Importamos useEffect para inicializar localStorage

// Nombre de la clave para guardar la preferencia en localStorage
const LOCAL_STORAGE_KEY = 'user-language-preference';

export function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();

  // Opcional: Esto asegura que, cuando la página se carga por primera vez
  // (por ejemplo, después de una detección inicial del middleware), 
  // la preferencia se guarde inmediatamente.
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    } catch (e) {
      console.error("No se pudo escribir en localStorage", e);
    }
  }, [lang]);

  // helpers
  const makePath = (targetLang: string) =>
    pathname.replace(`/${lang}`, `/${targetLang}`);

  // 🛑 Función para manejar el clic y guardar la preferencia
  const handleLanguageChange = (targetLang: string) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, targetLang);
    } catch (e) {
      console.error("No se pudo escribir en localStorage", e);
    }
    // No necesitamos manejar la navegación, Next.js Link lo hace por nosotros.
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium select-none">

      {/* ES */}
      <Link 
        href={makePath("es")}
        // 🛑 Agregamos el handler onClick para ES
        onClick={() => handleLanguageChange("es")}
      >
        <span
          className={
            lang === "es"
              ? "text-black font-semibold underline cursor-pointer"
              : "text-gray-400 hover:text-black cursor-pointer"
          }
        >
          ES
        </span>
      </Link>

      <span className="text-gray-300">|</span>

      {/* EN */}
      <Link 
        href={makePath("en")}
        // 🛑 Agregamos el handler onClick para EN
        onClick={() => handleLanguageChange("en")}
      >
        <span
          className={
            lang === "en"
              ? "text-black font-semibold underline cursor-pointer"
              : "text-gray-400 hover:text-black cursor-pointer"
          }
        >
          EN
        </span>
      </Link>
    </div>
  );
}