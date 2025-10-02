import type React from "react"
interface ErrorStateProps {
  error: string
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="container mx-auto p-4 text-center text-red-500">
      <p className="text-xl font-semibold">{error}</p>
    </div>
  )
}

export default ErrorState
