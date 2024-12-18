import { Car, Truck, ShowerHead, GiftIcon, Tv, Wifi, Film, Bed, Sofa, Building2, Stethoscope, Coffee, UtensilsCrossed, Droplets, UserRound, SpadeIcon } from 'lucide-react'

export const amenities = [
  {
    id: "airport-transport",
    label: "Transporte de aeropuerto",
    icon: Car
  },
  {
    id: "clinic-transport",
    label: "Traslados desde y hacia la clínica",
    icon: Truck
  },
  {
    id: "cleaning",
    label: "Servicio de limpieza",
    icon: ShowerHead
  },
  {
    id: "massage-room",
    label: "Sala de masajes",
    icon: GiftIcon
  },
  {
    id: "massage-packages",
    label: "Paquetes de masajes",
    icon: GiftIcon
  },
  {
    id: "tv",
    label: "TV",
    icon: Tv
  },
  {
    id: "wifi",
    label: "WiFi",
    icon: Wifi
  },
  {
    id: "netflix",
    label: "Netflix",
    icon: Film
  },
  {
    id: "hospital-bed",
    label: "Cama eléctrica hospitalaria",
    icon: Bed
  },
  {
    id: "laundry",
    label: "Lavandería paga",
    icon: ShowerHead
  },
  {
    id: "extra-bed",
    label: "Sofá cama para acompañante con recargo",
    icon: Sofa
  },
  {
    id: "city-tour",
    label: "City Tour",
    icon: Building2
  },
  {
    id: "nursing",
    label: "Servicio de enfermería 24 horas",
    icon: Stethoscope
  },
  {
    id: "breakfast",
    label: "Solo desayuno",
    icon: Coffee
  },
  {
    id: "full-board",
    label: "Alimentación completa",
    icon: UtensilsCrossed
  },
  {
    id: "hyperbaric",
    label: "Cámara hiperbárica",
    icon: Droplets
  },
  {
    id: "specialist",
    label: "Visita del especialista en su alojamiento",
    icon: UserRound
  },
  {
    id: "spa",
    label: "Spa",
    icon: SpadeIcon
  },
] as const

export type AmenityId = typeof amenities[number]['id']

