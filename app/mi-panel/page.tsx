import { Building2, Calendar, DollarSign, Users } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      label: "Propiedades",
      value: "3",
      icon: Building2,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Reservas Totales",
      value: "2",
      change: "+12% este mes",
      icon: Calendar,
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      label: "Ingresos del Mes",
      value: "$2810",
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Confirmadas",
      value: "1",
      icon: Users,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ]

  const recentBookings = [
    {
      property: "Propiedad no encontrada",
      guest: "María García",
      dates: "14 feb - 17 feb",
      price: "$360",
      status: "Confirmed",
    },
    {
      property: "Propiedad no encontrada",
      guest: "Juan López",
      dates: "28 feb - 07 mar",
      price: "$2450",
      status: "Pending",
    },
  ]

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
      </div>
    </div>
  )
}
