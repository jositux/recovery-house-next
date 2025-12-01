import { GoogleMap } from "@/components/ui/google-map"

interface LocationSectionProps {
  latitude: number
  longitude: number
}

export function LocationSection({ latitude, longitude }: LocationSectionProps) {
  return (
    <div className="mb-8">
       <div className="h-[300px] w-full relative rounded-lg overflow-hidden">
        <GoogleMap lat={latitude} lng={longitude} />
      </div>
    </div>
  )
}
