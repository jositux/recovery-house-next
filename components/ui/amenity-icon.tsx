import { type LucideIcon } from 'lucide-react'

interface AmenityIconProps {
  icon: LucideIcon
  label: string
}

export function AmenityIcon({ icon: Icon, label }: AmenityIconProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-[#39759E]" />
      <span className="text-sm text-[#162F40]">{label}</span>
    </div>
  )
}

