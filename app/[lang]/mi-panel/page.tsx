"use client"

import { Building2, Calendar, DollarSign, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/services/userService"

interface Booking {
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

interface Statistics {
  propertyQuantity: number
  roomQuantity: number
  bookingQuantity: number
  paymentReceivedAmountSum: number
  reviewQuantity: number
  currentMonthBookings: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      const token = localStorage.getItem("access_token")

      if (!token) {
        router.push("/login")
        return
      }

      try {
        const user = await getCurrentUser(token)

        const [statisticsResponse, bookingsResponse] = await Promise.all([
          fetch(`/webapi/api/v1/owner/statistics`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(
            `/webapi/items/Booking?filter[ownerId][_eq]=${user.id}&fields=*,+room.*,+room.propertyId.*&sort=-bookingDateCreated&limit=5`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ])

        if (statisticsResponse.ok) {
          const statsData = await statisticsResponse.json()
          setStatistics(statsData.data || statsData)
        } else {
          setError("Error al cargar las estadísticas")
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
     
          setBookings(bookingsData.data || [])
        } else {
          setError("Error al cargar las reservas")
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  const stats = [
    {
      label: "Propiedades",
      value: statistics?.propertyQuantity?.toString() || "0",
      icon: Building2,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Reservas Recibidas",
      value: statistics?.bookingQuantity?.toString() || "0",
      change:
        statistics?.currentMonthBookings && statistics.currentMonthBookings > 0
          ? `+${statistics.currentMonthBookings} este mes`
          : undefined,
      icon: Calendar,
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      label: "Ingresos Totales",
      value: `$${statistics?.paymentReceivedAmountSum?.toFixed(0) || "0"}`,
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Opiniones",
      value: statistics?.reviewQuantity?.toString() || "0",
      icon: Users,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ]

  const recentBookings = bookings.map((booking) => {
    let price = `$${booking.finalPrice}`
    let status = "Pendiente"
    const roomName = booking.roomName

    if (booking.paymentState === "pendingRefund") {
      status = "Pagado 10%"
      price = `$${booking.prepaymentAmount}`
    } else if (booking.paymentState === "fullpayment" || booking.paymentState === "balancepayment") {
      status = "Pago total"
      price = `$${booking.finalPrice}`
    }

    return {
      property: booking.room?.propertyId?.name || booking.propertyName || "Propiedad no encontrada",
      guest: booking.patientName || "Huésped",
      dates: `${new Date(booking.checkIn).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })} - ${new Date(booking.checkOut).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })}`,
      price,
      status,
      roomName,
    }
  })

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
  <h2 className="text-xl font-bold text-gray-900 mb-6">Reservas Recientes</h2>
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
    <p className="text-gray-500 text-center py-8">No hay reservas recientes</p>
  )}
</div>

    </div>
  )
}
