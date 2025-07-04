import { Suspense } from "react"
import { SuccessContent } from "./SuccessContent"

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
