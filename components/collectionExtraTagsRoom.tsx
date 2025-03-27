"use client"

import { TagButton } from "@/components/ui/tag-button-room"

interface ExtraTag {
  id: string
  name: string
  icon: string
  enable_property: boolean
  enable_services: boolean
}

interface RoomTag {
  id: string
  Room_id: string
  ExtraTags_id: string
}

interface ExtraTagsSelectorProps {
  extraTags: ExtraTag[] | null
  enable: string
  roomTags: RoomTag[]
}

export function CollectionExtraTags({ extraTags, enable, roomTags }: ExtraTagsSelectorProps) {
  if (!extraTags) {
    return null // or return a loading state or placeholder
  }

  // Filtra las etiquetas según la propiedad "enable" y si están en roomTags
  const filteredTags = extraTags.filter((tag) => {
    const isEnabled = enable === "property" ? tag.enable_property : enable === "services" ? tag.enable_services : true
    const isInRoomTags = roomTags.some((roomTag) => roomTag.ExtraTags_id === tag.id)
    return isEnabled && isInRoomTags
  })

  if (filteredTags.length === 0) {
    return <div className="text-[#162F40] p-4 bg-gray-50 rounded-md">No se encontraron etiquetas adicionales.</div>
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      role="list"
      aria-label="Lista de etiquetas adicionales"
    >
      {filteredTags.map((tag) => (
        <TagButton key={tag.id} id={tag.id} icon={tag.icon} label={tag.name} />
      ))}
    </div>
  )
}

