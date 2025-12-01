"use client"

import { TagButton } from "@/components/ui/tag-button-room"

interface ExtraTag {
  id: string
  name: string
  name_en: string
  icon: string
  enable_property: boolean
  enable_services: boolean
}

interface ExtraTagsSelectorProps {
  extraTags: ExtraTag[] | null
  enable: string
  roomTags: string[] // ahora es un array simple
  lang: string
}

export function CollectionExtraTagsService({ extraTags, enable, roomTags, lang }: ExtraTagsSelectorProps) {
  
  const isSpanish = lang === "es";

  if (!extraTags) {
    return null
  }

  // Filtra las etiquetas según si están habilitadas y si su id está incluido en roomTags
  const filteredTags = extraTags.filter((tag) => {
    const isEnabled = enable === "services" ? tag.enable_services : true
    const isInRoomTags = roomTags.includes(tag.id)
    return isEnabled && isInRoomTags
  })

  if (filteredTags.length === 0) {
    return (
      <div className="text-[#162F40] p-4 bg-gray-50 rounded-md">
        No se encontraron etiquetas adicionales.
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      role="list"
      aria-label="Lista de etiquetas adicionales"
    >
      {filteredTags.map((tag) => (
        <TagButton key={tag.id} id={tag.id} icon={tag.icon} label={isSpanish ? tag.name : tag.name_en} />
      ))}
    </div>
  )
}
