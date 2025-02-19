import type React from "react"
import { DynamicIcon } from "lucide-react/dynamic";

// Lista de íconos válidos de lucide-react
const validIcons = [
  "camera",
  "heart",
  "search",
  "home",
  "bell",
  "star",
  "ghost",
  "wifi",
] as const;

type IconName = typeof validIcons[number];

interface TagButtonProps {
  id: string
  icon: string
  label: string

}

export const TagButton: React.FC<TagButtonProps> = ({ id, icon, label }) => {
  const iconToUse: IconName = validIcons.includes(icon as IconName) ? (icon as IconName) : "home";

  return (
    <button
      id={id}

    >
       <DynamicIcon
          name={iconToUse}
          style={{ width: "24px", height: "24px" }}
        />
       {label}
    </button>
  )
}

