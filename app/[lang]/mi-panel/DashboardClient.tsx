"use client"

import { Building2, Calendar, DollarSign, Users } from "lucide-react"
//import { useRouter } from "next/navigation" 
// Importamos el tipo Locale
import { type Locale } from "@/lib/i18n" 

// --- 1. INTERFACES (Definidas para tipado y exportadas) ---

export interface Booking {
  id: string
  status: string
  checkOut: string
  checkIn: string
  guests: number
  price: string
  cleaning: string
  roomName: string
  propertyName: string
  ownerName: string
  patientName: string
  isPrivate: boolean
  propertyId: string
  bookingState: string
  paymentState: string
  prepaymentAmount: string
  balanceAmount: string
  fullAmount: string
  finalPrice: string
  ownerId: string
  bookingDateCreated: string
  room: {
    name: string
    propertyId: {
      name: string
    }
  }
}

export interface Statistics {
  propertyQuantity: number
  roomQuantity: number
  bookingQuantity: number
  paymentReceivedAmountSum: number
  reviewQuantity: number
  currentMonthBookings: number
}

// Props que recibe del Server Component
export interface DashboardClientProps {
    lang: Locale;
    bookings: Booking[];
    statistics: Statistics | null;
    loading: boolean;
    error: string | null;
}

// --- 2. CLIENT COMPONENT (Renders the UI) ---

/**
 * @component DashboardClient
 * @description Componente de cliente responsable de renderizar la UI del dashboard,
 * utilizando datos pre-cargados por el Server Component y el idioma ('lang').
 */
export function DashboardClient({ lang, bookings, statistics, loading, error }: DashboardClientProps) {
  
  // No necesitamos useRouter() o useEffect() aquí, ya que la redirección
  // y la carga de datos se movieron al Server Component.

  const isSpanish = lang === "es";
  // Función de utilidad para traducir cadenas simples
  const t = (es: string, en: string) => isSpanish ? es : en;
  
  // --- Estados de carga y error ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }


  // --- Procesamiento de Datos para la UI (usando 't' para traducción) ---

  const stats = [
    {
      label: t("Propiedades", "Properties"),
      value: statistics?.propertyQuantity?.toString() || "0",
      icon: Building2,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: t("Reservas Recibidas", "Bookings Received"),
      value: statistics?.bookingQuantity?.toString() || "0",
      change:
        statistics?.currentMonthBookings && statistics.currentMonthBookings > 0
          ? t(`+${statistics.currentMonthBookings} este mes`, `+${statistics.currentMonthBookings} this month`)
          : undefined,
      icon: Calendar,
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      label: t("Ingresos Totales", "Total Revenue"),
      value: `$${statistics?.paymentReceivedAmountSum?.toFixed(0) || "0"}`,
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: t("Opiniones", "Reviews"),
      value: statistics?.reviewQuantity?.toString() || "0",
      icon: Users,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ]

  const recentBookings = bookings.map((booking) => {
    let price = `$${booking.finalPrice}`
    let status = t("Pendiente", "Pending")
    const roomName = booking.roomName

    if (booking.paymentState === "pendingRefund") {
      status = t("Pagado 10%", "Paid 10%")
      price = `$${booking.prepaymentAmount}`
    } else if (booking.paymentState === "fullpayment" || booking.paymentState === "balancepayment") {
      status = t("Pago total", "Full Payment")
      price = `$${booking.finalPrice}`
    }

    // Usamos 'lang' para el formato de fecha
    const dates = `${new Date(booking.checkIn).toLocaleDateString(lang, {
        day: "numeric",
        month: "short",
      })} - ${new Date(booking.checkOut).toLocaleDateString(lang, {
        day: "numeric",
        month: "short",
      })}`

    return {
      property: booking.room?.propertyId?.name || booking.propertyName || t("Propiedad no encontrada", "Property not found"),
      guest: booking.patientName || t("Huésped", "Guest"),
      dates,
      price,
      status,
      roomName,
    }
  })


  // --- Renderizado de UI ---

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <span>↗</span>
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t("Reservas Recientes", "Recent Bookings")}</h2>
        {recentBookings.length > 0 ? (
          <div className="space-y-4">
            {recentBookings.map((booking, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:justify-between transition-colors border-b border-gray-200 last:border-0 pb-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {booking.roomName} - {booking.property}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {booking.guest} • {booking.dates}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-lg font-bold text-green-500">{booking.price}</p>
                  <p className="text-sm text-gray-600">{booking.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">{t("No hay reservas recientes", "No recent bookings")}</p>
        )}
      </div>
    </div>
  )
}