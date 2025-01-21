"use client";

import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipCardProps {
  id: string;
  name: string;
  description: string;
  priceYear: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function MembershipCard({
  id,
  name,
  description,
  priceYear,
  isSelected,
  onSelect,
}: MembershipCardProps) {
  const colorVariants = {
    gold: isSelected ? "text-white" : "text-yellow-600",
    silver: isSelected ? "text-white" : "text-gray-400",
    bronze: isSelected ? "text-white" : "text-amber-700",
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "w-full p-4 rounded-lg border transition-all duration-200",
        "hover:border-gray-400 hover:shadow-sm",
        "flex items-start gap-4 text-left",
        isSelected ? "border-primary bg-primary text-white" : "border-gray-200"
      )}
    >
      <Medal
        className={cn(
          "h-8 w-8",
          colorVariants[id as keyof typeof colorVariants]
        )}
      />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">{name}</h3>
          <span className="font-medium">${priceYear}/year</span>
        </div>
        <div
          className={cn(
            "text-sm",
            isSelected ? "text-white/90" : "text-gray-600"
          )}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </button>
  );
}
