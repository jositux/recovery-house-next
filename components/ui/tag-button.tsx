import React from "react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "lucide-react/dynamic";

// Lista de íconos válidos de lucide-react
const validIcons = [
  "camera", "heart", "search", "home", "bell", "star", "ghost", "wifi", "toilet", "plane", "coffee", "train-front-tunnel", "bed-double", "washing-machine", "accessibility", "biceps-flexed", "speech", "map-pinned", "briefcase-medical", "cooking-pot", "bus", "person-standing", "sparkles", "heart-handshake", "book-type", "users", "eye-closed", "alarm-clock-plus"
] as const;

type IconName = typeof validIcons[number];

interface TagButtonProps {
  id: string;
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function TagButton({ icon, label, selected, onClick, className }: TagButtonProps) {
  const iconToUse: IconName = validIcons.includes(icon as IconName) ? (icon as IconName) : "home";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center p-2 md:p-4 cursor-pointer border rounded-lg shadow-sm transition-all sm:flex-row flex-col sm:items-center",
        selected
          ? "bg-[#39759E] text-white shadow-lg"
          : "bg-white text-[#39759E] hover:bg-gray-100",
        "border-[#39759E] hover:shadow-md",
        className
      )}
    >
      {/* Ícono en la parte superior en mobile y a la izquierda en pantallas grandes */}
      <div
        className="flex items-center justify-center sm:mr-3 mb-2 sm:mb-0"
        style={{ width: "24px", height: "24px" }}
      >
        <DynamicIcon
          name={iconToUse}
          style={{ width: "24px", height: "24px" }}
        />
      </div>
      {/* Etiqueta con fuente más fina */}
      <span className="text-sm">{label}</span>
    </div>
  );
}
