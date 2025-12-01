import { Card, CardContent } from "@/components/ui/card"

interface HostProfileProps {
  hostName: string
  hostExperience: string
  averageRating: number
  totalReviews: number
  lang: string // Parámetro de idioma añadido
}

export function HostProfile({ hostName, hostExperience, averageRating, totalReviews, lang }: HostProfileProps) {
  const isSpanish = lang === "es";

  const texts = {
    rating: isSpanish ? "Calificación" : "Rating",
    reviews: isSpanish ? "Reseñas" : "Reviews",
    verified: isSpanish ? "Verificadas" : "Verified",
  };
  
  return (
    <Card className="mb-8 border border-border shadow-sm">
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
              {/* Usamos la primera letra del nombre del host como marcador de posición */}
              <span className="text-white text-2xl font-bold">
                {hostName ? hostName[0].toUpperCase() : 'H'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">{hostName}</h3>
              <p className="text-muted-foreground text-sm">{hostExperience}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{averageRating}</div>
              <div className="text-sm text-muted-foreground">{texts.rating}</div>
              <div className="flex justify-center mt-1">
                {/* Renderizado simple de estrellas de calificación */}
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-amber-500 fill-current' : 'text-gray-300 fill-transparent'}`}
                  >
                    ★
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{totalReviews}</div>
              <div className="text-sm text-muted-foreground">{texts.reviews}</div>
              <div className="text-xs text-muted-foreground mt-1">{texts.verified}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}