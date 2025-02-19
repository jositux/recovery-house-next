import type React from "react"
import { DynamicIcon } from "lucide-react/dynamic"

// Lista de íconos válidos de lucide-react
const validIcons = ["camera", "heart", "search", "home", "bell", "star", "ghost", "wifi"] as const

type IconName = (typeof validIcons)[number]

interface TagButtonProps {
  id: string
  icon: string
  label: string
}

export const TagButton: React.FC<TagButtonProps> = ({ id, icon, label }) => {
  const iconToUse: IconName = validIcons.includes(icon as IconName) ? (icon as IconName) : "home"

  return (
    <div id={id} className="flex items-center p-2 bg-white rounded-md">
      <DynamicIcon name={iconToUse} className="w-5 h-5 mr-2 text-gray-600 flex-shrink-0" />
      <span className="text-sm text-gray-800">{label}</span>
    </div>
  )
}

