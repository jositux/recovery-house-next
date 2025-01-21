import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Search, Bell, Heart } from 'lucide-react'; // Importa los íconos que necesites

interface ServiceButtonProps {
  id: string;
  icon?: string; // Hacemos que el icon sea opcional
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function ServiceButton({ icon, label, selected, onClick, className }: ServiceButtonProps) {
  // Mapa de íconos
  const iconMap: Record<string, React.ElementType> = {
    home: Home,
    search: Search,
    bell: Bell,
    heart: Heart, // Asegúrate de agregar todos los íconos que deseas utilizar
  };

  // Solo usamos un ícono si se pasa el parámetro 'icon' y si está en el mapa
  const LucideIcon = icon && iconMap[icon.toLowerCase()] ? iconMap[icon.toLowerCase()] : null;

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "flex items-center justify-start space-x-2 w-full",
        selected ? "bg-[#4A7598] text-white" : "bg-gray-100 text-[#4A7598]",
        "border-[#4A7598] border",
        selected ? "hover:bg-[#4A7598] hover:border-[#4A7598] hover:text-white" : "hover:border-[#4A7598]",
        "active:bg-[#4A7598] active:text-white",
        className
      )}
      onClick={onClick}
    >
      {/* Si LucideIcon no es null, lo renderizamos */}
      {LucideIcon && <LucideIcon />}
      <span>{label}</span>
    </Button>
  );
}
