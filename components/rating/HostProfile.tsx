import { Card, CardContent } from "@/components/ui/card"

interface HostProfileProps {
  hostName: string
  hostExperience: string
  averageRating: number
  totalReviews: number
}

export function HostProfile({ hostName, hostExperience, averageRating, totalReviews }: HostProfileProps) {
  return (
    <Card className="mb-8 border border-border shadow-sm">
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">V</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">{hostName}</h3>
              <p className="text-muted-foreground text-sm">{hostExperience}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{averageRating}</div>
              <div className="text-sm text-muted-foreground">Calificación</div>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="w-4 h-4 text-amber-500 fill-current">
                    ★
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{totalReviews}</div>
              <div className="text-sm text-muted-foreground">Reseñas</div>
              <div className="text-xs text-muted-foreground mt-1">Verificadas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
