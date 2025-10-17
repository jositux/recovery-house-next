interface ReviewData {
  cleanliness: number
  atention: number
  location: number
  accuracy: number
  comment: string
}

interface ReviewDebugPanelProps {
  reviewData: ReviewData
  average: number
}

export function ReviewDebugPanel({ reviewData, average }: ReviewDebugPanelProps) {
  return (
    <div className="mt-8 rounded-lg border bg-muted p-4">
      <h2 className="mb-4 font-semibold">Datos de la review:</h2>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Limpieza e higiene:</strong> {reviewData.cleanliness > 0 ? reviewData.cleanliness : "No calificado"}
        </p>
        <p>
          <strong>Comunicación y acompañamiento:</strong>{" "}
          {reviewData.atention > 0 ? reviewData.atention : "No calificado"}
        </p>
        <p>
          <strong>Ubicación:</strong> {reviewData.location > 0 ? reviewData.location : "No calificado"}
        </p>
        <p>
          <strong>Seguridad y control:</strong> {reviewData.accuracy > 0 ? reviewData.accuracy : "No calificado"}
        </p>
        <p>
          <strong>Promedio:</strong> {average.toFixed(2)} (solo criterios calificados)
        </p>
        <p>
          <strong>Comentario:</strong> {reviewData.comment || "Sin comentario"}
        </p>
      </div>
    </div>
  )
}
