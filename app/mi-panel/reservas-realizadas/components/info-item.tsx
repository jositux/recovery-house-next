import type React from "react"

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

export const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-center">
    <div className="h-5 w-5 text-gray-500 mr-2">{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
)
