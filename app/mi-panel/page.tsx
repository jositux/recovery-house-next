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
  finalPrice: string
  bookingDateCreated: string
  room: {
    name: string
    propertyId: {
      name: string
    }
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
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

        const bookingsResponse = await fetch(
          `/webapi/items/Booking?filter[ownerId][_eq]=${user.id}&fields=*, +room.*, +room.photos.directus_files_id.id, +room.propertyId.*&sort=-bookingDateCreated`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (bookingsResponse.ok) {
          const data = await bookingsResponse.json()
          setBookings(data.data || [])
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

  const uniqueProperties = new Set(bookings.map((b) => b.propertyId))
  //const confirmedBookings = bookings.filter((b) => b.bookingState === "confirmed")
  
  const totalIncome = bookings
  .filter((b) => b.paymentState === "fullpayment" || b.paymentState === "prepayment")
  .reduce((sum, b) => {
    const amount =
      b.paymentState === "fullpayment"
        ? Number.parseFloat(b.finalPrice || "0")
        : Number.parseFloat(b.prepaymentAmount || "0")
    return sum + amount
  }, 0)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const currentMonthBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.bookingDateCreated)
    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
  })

  const stats = [
    {
      label: "Propiedades",
      value: uniqueProperties.size.toString(),
      icon: Building2,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Reservas Recibidas",
      value: bookings.length.toString(),
      change: currentMonthBookings.length > 0 ? `+${currentMonthBookings.length} este mes` : undefined,
      icon: Calendar,
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      label: "Ingresos Totales",
      value: `$${totalIncome.toFixed(0)}`,
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Opiniones",
      value: 0,
      icon: Users,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ]

  const recentBookings = bookings.slice(0, 5).map((booking) => {
    let price = `$${booking.finalPrice}`
    let status = "Pendiente"
  
    if (booking.paymentState === "prepayment") {
      status = "Reservada con adelanto"
      price = `$${booking.prepaymentAmount}`
    } else if (booking.paymentState === "fullpayment") {
      status = "Reservada pago total"
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
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.property}</h3>
                  <p className="text-sm text-gray-600">
                    {booking.guest} • {booking.dates}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-500">{booking.price}</p>
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
