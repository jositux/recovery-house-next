import { Award } from "lucide-react"

interface RatingOverviewProps {
  averageRating: number
  totalReviews: number
}

export function RatingOverview({ averageRating, totalReviews }: RatingOverviewProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600" />
              <span className="text-lg font-semibold text-amber-800">Favorito entre huéspedes</span>
              <Award className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{averageRating}</div>
            <div className="flex justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-5 h-5 text-amber-500 fill-current">
                  ★
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{totalReviews}</div>
            <div className="text-sm text-muted-foreground">Evaluaciones</div>
          </div>
        </div>

        <div className="text-center mt-3">
          <p className="text-amber-700 font-medium">
            Según los huéspedes, uno de los alojamientos más valorados en Airbnb
          </p>
        </div>
      </div>
    </div>
  )
}
