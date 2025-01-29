"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MenuProfile } from "@/components/MenuProfile";
import { MenuActions } from "@/components/MenuActions";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verificar si el token de acceso existe en localStorage
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token); // Si el token existe, está logueado
  }, []);

  return (
    <header className="bg-[#4A7598] p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Logo grande visible en pantallas medianas y grandes */}
          <div className="hidden sm:block">
            <Image
              src="/assets/logo.svg"
              alt="Recovery Care Solutions"
              width={180}
              height={60}
            />
          </div>
          {/* Logo mini visible en pantallas pequeñas */}
          <div className="block sm:hidden">
            <Image
              src="/assets/logo-mini.svg"
              alt="Recovery Care Solutions"
              width={40}
              height={40}
            />
          </div>
        </Link>

        {/* Botones */}
        <div className="flex items-center gap-4">
          {/* Botón de login, solo visible si no está logueado */}
          {!isLoggedIn && (
            <Button
              variant="secondary"
              className="bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <Link href="/login">Ingresar</Link>
            </Button>
          )}

          {/* Menú de perfil y acciones, solo visible si está logueado */}
          {isLoggedIn && (
            <>
              <MenuProfile name="Carlos Jose Guaimas" />
              <MenuActions />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
