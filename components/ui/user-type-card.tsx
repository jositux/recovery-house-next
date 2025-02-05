import { type LucideIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

interface UserTypeCardProps {
  icon: LucideIcon
  title: string
  description: string
  selected?: boolean
  onClick?: () => void
  "aria-label"?: string
  textSize?: "default" | "small"
}

export function UserTypeCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  "aria-label": ariaLabel,
  textSize = "default",
}: UserTypeCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex gap-4 p-6 cursor-pointer rounded-lg border transition-all",
        selected 
          ? "border-[#39759E] bg-[#39759E] text-white" 
          : "hover:border-[#39759E]/50 hover:shadow-sm"
      )}
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Icon className={cn(
        "h-6 w-6 shrink-0 mt-1",
        selected ? "text-white" : "text-[#39759E]"
      )} aria-hidden="true" />
      <div className="space-y-1">
        <h3 className={cn(
          selected ? "text-white" : "text-[#162F40]",
          textSize === "small" ? "text-sm" : "text-xl"
        )}>{title}</h3>
        <p className={cn(
          "text-sm",
          selected ? "text-white/90" : "text-[#162F40]",
          textSize === "small" && "text-xs"
        )}>{description}</p>
      </div>
    </div>
  )
}

