import { Phone, Mail } from 'lucide-react'

interface ServiceProviderCardProps {
  name: string
  service: string
  treatment: string
  phone: string
  email: string
}

export function ServiceProviderCard({ name, service, treatment, phone, email }: ServiceProviderCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900">{service}</h3>
        <p className="text-sm text-gray-600">{treatment}</p>
      </div>
      <div className="mb-2">
        <p className="font-medium">Proveedor</p>
        <p className="text-sm text-gray-600">{name}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{email}</span>
        </div>
      </div>
    </div>
  )
}

