"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();

  // helpers
  const makePath = (targetLang: string) =>
    pathname.replace(`/${lang}`, `/${targetLang}`);

  return (
    <div className="flex items-center gap-2 text-sm font-medium select-none">

      {/* ES */}
      <Link href={makePath("es")}>
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
      <Link href={makePath("en")}>
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
