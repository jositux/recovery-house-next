interface RoomDescriptionProps {
  description: string
}

export function RoomDescription({ description }: RoomDescriptionProps) {
  if (!description || description.trim() === "") return null

  return (
    <div className="mb-8">
      <div className="text-[#162F40] prose" dangerouslySetInnerHTML={{ __html: description }} />
    </div>
  )
}
