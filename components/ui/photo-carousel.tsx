import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"
import { X } from "lucide-react"

interface PhotoCarouselProps {
  photos: string[]
  onClose: () => void
}

export function PhotoCarousel({ photos, onClose }: PhotoCarouselProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogTitle>bebe</DialogTitle>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <button onClick={onClose} className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md">
          <X className="h-6 w-6" />
        </button>
        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[80vh]">
                  <Image
                    src={photo || "/placeholder.svg"}
                    alt={`Photo ${index + 1}`}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}

