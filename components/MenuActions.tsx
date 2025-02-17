"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Building, HandHeart, Search } from "lucide-react";
import Link from "next/link";

export function MenuActions() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón para abrir/cerrar el menú */}
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white hover:bg-gray-700 focus:outline-none"
        onClick={toggleMenu}
      >
        <Plus className="w-5 h-5" />
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
          <li className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <Link href="/registrar-propiedad" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Agregar Propiedad
            </Link>
          </li>
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <Link href="/subscriptions" className="flex items-center gap-2">
              <HandHeart className="w-4 h-4" />
              Agregar Servicio
            </Link>
          </li>
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <Link href="/rooms" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar Alojamiento
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
