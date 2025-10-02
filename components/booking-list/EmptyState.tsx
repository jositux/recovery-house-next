import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"

const EmptyState = () => {
  return (
    <main className="flex-grow flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Encuentra tu espacio ideal para una recuperación tranquila!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Aún no tienes reservas, pero estamos aquí para ayudarte a encontrar la casa de recuperación perfecta para tu
          proceso de sanación y bienestar.
        </p>
        <Button
          className="inline-flex items-center px-6 py-3 text-white bg-[#4A90E2] hover:bg-[#3A7BC8] transition-colors duration-300"
          asChild
        >
          <Link href="/rooms">
            <Search className="mr-2 h-5 w-5" />
            Buscar casa de recuperación
          </Link>
        </Button>
      </div>
    </main>
  )
}

export default EmptyState
