import React from "react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "lucide-react/dynamic"; // Importamos DynamicIcon

// Lista de íconos válidos de lucide-react
const validIcons = [
  "camera",
  "heart",
  "search",
  "home",
  "bell",
  "star",
  "ghost",
  "wifi", // Añade más íconos si es necesario
] as const;

type IconName = typeof validIcons[number]; // Tipo estricto basado en la lista de íconos válidos

interface TagButtonProps {
  id: string;
  icon: string; // icon es un string genérico
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function TagButton({ icon, label, selected, onClick, className }: TagButtonProps) {
  // Si el icono no es válido o está vacío, usamos "home" por defecto
  const iconToUse: IconName = validIcons.includes(icon as IconName) ? (icon as IconName) : "home";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center p-4 cursor-pointer border rounded-lg shadow-sm transition-all",
        selected
          ? "bg-[#39759E] text-white shadow-lg"
          : "bg-white text-[#39759E] hover:bg-gray-100",
        "border-[#39759E] hover:shadow-md",
        className
      )}
    >
      {/* Contenedor del ícono con tamaño fijo */}
      <div
        className="flex items-center justify-center mr-3"
        style={{
          width: "24px", // Tamaño fijo del contenedor
          height: "24px",
        }}
      >
        {/* Ícono con tamaño fijo */}
        <DynamicIcon
          name={iconToUse}
          style={{
            width: "24px",
            height: "24px",
          }}
        />
      </div>
      {/* Etiqueta */}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
