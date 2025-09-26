"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
//import { RatingOverview } from "@/components/rating/RatingOverview"
import { HostProfile } from "@/components/rating/HostProfile"
import { ReviewsModal } from "@/components/rating/ReviewsModal"

interface Review {
  id: string
  userName: string
  userLocation: string
  rating: number
  date: string
  stayType: string
  comment: string
  avatar: string
}

const mockReviews: Review[] = [
  {
    id: "1",
    userName: "Julio Cesar",
    userLocation: "Jalpa de Méndez, México",
    rating: 5,
    date: "agosto de 2025",
    stayType: "Estadía de algunas noches",
    comment:
      "Fue de nuestro agrado en todos los sentidos, una hermosa vista desde el balcón y es tal como se describe. Muy céntrico y cerca de lugares importantes de la ciudad. Valentino se portó muy amable, con regresaríamos de nuevo.",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screen%20Shot%202025-09-26%20at%2010.40.04-2M7A9s8ARIFr8uXeBtstQNJk8dG46v.png",
  },
  {
    id: "2",
    userName: "Loreley",
    userLocation: "Bahía Blanca, Argentina",
    rating: 5,
    date: "julio de 2025",
    stayType: "Estadía con niños",
    comment:
      "El departamento es hermoso, está muy bien ubicado y cuenta con todas las comodidades. Valentino fue claro en las instrucciones. Tuvimos la mala suerte de que se rompiera el ascensor y mandó a alguien a ayudarnos a bajar las maletas. Sin dudas súper recomendable! Lo único a tener en cuenta es que hay una disco cerca y se escucha bastante el ruido. nosotras estábamos cansadas de un vuelo de 13 horas y con jet lag así que dormimos igual, lo más bien. La terraza también es hermosa para tomarse unos mates con el solcito.",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screen%20Shot%202025-09-26%20at%2010.40.04-2M7A9s8ARIFr8uXeBtstQNJk8dG46v.png",
  },
]

export default function UserRatingPage() {
  const [showReviews, setShowReviews] = useState(false)

  const averageRating = 4.98
  const totalReviews = 51
  const hostName = "Valentino"
  const hostExperience = "4 meses de experiencia como anfitrión"

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Evaluaciones</h1>
          <p className="text-muted-foreground">Conoce lo que dicen nuestros huéspedes</p>
        </div>

        {/*<RatingOverview averageRating={averageRating} totalReviews={totalReviews} />*/}

        <HostProfile
          hostName={hostName}
          hostExperience={hostExperience}
          averageRating={averageRating}
          totalReviews={totalReviews}
        />

        <div className="text-center">
          <Button
            onClick={() => setShowReviews(true)}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium rounded-lg"
          >
            Ver todas las evaluaciones ({totalReviews})
          </Button>
        </div>

        <ReviewsModal
          isOpen={showReviews}
          onClose={setShowReviews}
          reviews={mockReviews}
          averageRating={averageRating}
          totalReviews={totalReviews}
        />
      </div>
    </div>
  )
}
