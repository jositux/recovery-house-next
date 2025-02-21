import { Phone, Mail } from 'lucide-react'

interface ServiceProviderCardProps {
  name: string
  service: string
  description: string
  treatment: string
  phone: string
  email: string
}

export function ServiceProviderCard({ name, description, phone, email }: ServiceProviderCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="mb-2">
        <h3 className="font-semibold text-[#162F40]">{name}</h3>
        <p className="text-sm text-[#162F40]">{description}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-[#162F40]">
          <Phone className="h-4 w-4" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#162F40]">
          <Mail className="h-4 w-4" />
          <span>{email}</span>
        </div>
      </div>
    </div>
  )
}

