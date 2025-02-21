"use client";

import { useState, useEffect, useRef } from "react";
import { Building, User, BedIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/LogoutService";

interface ProfileMenuProps {
  name: string; // Nombre del usuario
}

export function MenuProfile({ name }: ProfileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout utilizando el servicio
  const handleLogout = async () => {
    try {
      // Obtén el accessToken desde localStorage
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No se encontró el token de acceso");
        return;
      }

      // Llama al servicio de logout
      await logoutUser(accessToken);

      // Limpia el localStorage y redirige al login
      localStorage.removeItem("access_token");

      window.dispatchEvent(new Event("storage"));

      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón para abrir/cerrar el menú */}
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white hover:bg-gray-700 focus:outline-none"
        onClick={toggleMenu}
      >
        <User className="w-5 h-5" />
      </button>

      {/* Menú desplegable */}
      <div
        className={`absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg z-10 transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible"
        }`}
      >
        <ul className="text-sm text-[#162F40]">
          {/*<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <Link href="/mi-perfil" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Mi Perfil
            </Link>
      </li>*/}
          <li className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <Link href="/mis-propiedades" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Mis propiedades
            </Link>
          </li>
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          >
             <Link href="/mis-reservas" className="flex items-center gap-2">
            <BedIcon className="w-4 h-4" />
            Mis reservas
            </Link>
          </li>
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          >
             <Link href="/mi-servicio" className="flex items-center gap-2">
            <BedIcon className="w-4 h-4" />
            Mi Servicio
            </Link>
          </li>

          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            onClick={handleLogout}
          >
             
            <LogOut className="w-4 h-4" />
            Salir
            
          </li>
        </ul>
        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-[#162F40]">
          <p>{name}</p>
         
        </div>
      </div>
    </div>
  );
}
