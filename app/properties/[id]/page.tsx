import { Bed, Bath, Users, Wifi, Car, AmbulanceIcon as FirstAid, Shirt, Waves, Tv, Clock, ChefHat, Hospital } from 'lucide-react'
import { BookingWidget } from '@/components/ui/booking-widget'
import { AmenityIcon } from '@/components/ui/amenity-icon'
import { ServiceProviderCard } from '@/components/ui/service-provider-card'
import { GoogleMap } from '@/components/ui/google-map'
import { propertiesData } from '../properties-data'
import { notFound } from 'next/navigation'

interface PageProps {
  params?: Promise<{ id: string }>
}

export default async function PropertyPage({ params }: PageProps) {
  // Verificar si params es undefined o una promesa
  if (!params) {
    notFound();
  }

  // Resolver params si es una promesa
  const resolvedParams = await params;

  // Buscar la propiedad correspondiente
  const property = propertiesData.properties.find(p => p.id === resolvedParams.id);

  if (!property) {
    notFound();
  }

  const amenities = [
    { icon: Wifi, label: 'WiFi' },
    { icon: Car, label: 'Traslados desde y hacia la clínica' },
    { icon: FirstAid, label: 'Servicio de Enfermería' },
    { icon: Shirt, label: 'Lavandería gratis' },
    { icon: Waves, label: 'Piscina/spa' },
    { icon: Tv, label: 'TV' },
    { icon: Clock, label: 'Servicio 24/7' },
    { icon: ChefHat, label: 'Chef' },
    { icon: Hospital, label: 'Clínica Médica/hospitalaria' }
  ];

  const serviceProviders = [
    {
      name: "Enfermería a Domicilio",
      service: "Cuidados de enfermería",
      phone: "300 123 4567",
      email: "enfermeria@cuidados.com",
      treatment: "Enfermería"
    },
    {
      name: "FisioTerapia Express",
      service: "Fisioterapia",
      phone: "301 234 5678",
      email: "info@fisioterapiaexpress.com",
      treatment: "Fisioterapia"
    },
    {
      name: "NutriSalud",
      service: "Nutrición y dietética",
      phone: "302 345 6789",
      email: "contacto@nutrisalud.com",
      treatment: "Nutrición"
    },
    {
      name: "PsicoApoyo",
      service: "Atención psicológica",
      phone: "303 456 7890",
      email: "citas@psicoapoyo.com",
      treatment: "Psicología"
    },
    {
      name: "FarmaCare 24/7",
      service: "Farmacia a domicilio",
      phone: "304 567 8901",
      email: "pedidos@farmacare.com",
      treatment: "Farmacia"
    },
    {
      name: "MediTransporte",
      service: "Transporte médico",
      phone: "305 678 9012",
      email: "reservas@meditransporte.com",
      treatment: "Transporte"
    },
    {
      name: "TerapiaOcupacional Plus",
      service: "Terapia ocupacional",
      phone: "306 789 0123",
      email: "info@terapiaocupacionalplus.com",
      treatment: "Terapia ocupacional"
    },
    {
      name: "LabExpress",
      service: "Laboratorio clínico móvil",
      phone: "307 890 1234",
      email: "resultados@labexpress.com",
      treatment: "Laboratorio"
    },
    {
      name: "FisioEquipos",
      service: "Alquiler de equipos médicos",
      phone: "308 901 2345",
      email: "alquileres@fisioequipos.com",
      treatment: "Equipos médicos"
    },
    {
      name: "CuidadoPaliativo en Casa",
      service: "Cuidados paliativos",
      phone: "309 012 3456",
      email: "atencion@cuidadopaliativo.com",
      treatment: "Paliativos"
    },
    {
      name: "RehabilitaHogar",
      service: "Adecuación de espacios",
      phone: "310 123 4567",
      email: "proyectos@rehabilitahogar.com",
      treatment: "Rehabilitación"
    },
    {
      name: "MasajesTerapéuticos a Domicilio",
      service: "Masajes terapéuticos",
      phone: "311 234 5678",
      email: "citas@masajesterapeuticos.com",
      treatment: "Masajes"
    }
  ];
  

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[500px] w-full">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Stats */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              <div className="flex gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Bed className="h-5 w-5" />
                  <span>3</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-5 w-5" />
                  <span>2</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  <span>4</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-600">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenidades / Servicios</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                  <AmenityIcon key={index} icon={amenity.icon} label={amenity.label} />
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">El vecindario</h2>
              <div className="h-[300px] w-full relative rounded-lg overflow-hidden">
                <GoogleMap lat={property.latitude} lng={property.longitude} />
              </div>
            </div>

            {/* Service Providers */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Proveedores de servicios</h2>
                <button className="text-[#4A7598]">Filtrar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {serviceProviders.map((provider, index) => (
                  <ServiceProviderCard
                    key={index}
                    name={provider.name}
                    service={provider.service}
                    treatment={provider.treatment}
                    phone={provider.phone}
                    email={provider.email}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <BookingWidget price={property.price} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
