import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
}

const LoadingState = ({ message = "Cargando mis reservas..." }: LoadingStateProps) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg text-gray-700">{message}</span>
    </div>
  )
}

export default LoadingState
