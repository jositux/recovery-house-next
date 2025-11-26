import { GoogleMap } from "@/components/ui/google-map"

interface LocationSectionProps {
  latitude: number
  longitude: number
}

export function LocationSection({ latitude, longitude }: LocationSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#162F40] mb-4">El vecindario</h2>
      <div className="h-[300px] w-full relative rounded-lg overflow-hidden">
        <GoogleMap lat={latitude} lng={longitude} />
      </div>
    </div>
  )
}
