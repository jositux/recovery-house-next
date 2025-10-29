import { ServiceProviderCard } from "@/components/ui/service-provider-card"

interface ServiceProvider {
  id: string
  name: string
  description: string
  serviceTags: number[]
  phone: string
  email: string
  state: string
  country: string
}

interface ServiceProvidersSectionProps {
  serviceProviders: ServiceProvider[]
  propertyState: string
  propertyCountry: string
}

export function ServiceProvidersSection({
  serviceProviders,
  propertyState,
  propertyCountry,
}: ServiceProvidersSectionProps) {
  const stateProviders = serviceProviders.filter((provider) => provider.state === propertyState)

  const providersToShow =
    stateProviders.length > 0
      ? stateProviders
      : serviceProviders.filter((provider) => provider.country === propertyCountry)

  if (providersToShow.length === 0) return null

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#162F40]">Proveedores de servicios</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providersToShow.map((provider) => (
          <ServiceProviderCard
            key={provider.id}
            name={provider.name}
            service={provider.description}
            treatment={provider.serviceTags.join(", ")}
            description={provider.description}
            phone={provider.phone}
            email={provider.email}
          />
        ))}
      </div>
    </div>
  )
}
