import type React from "react"
import BookingCard from "./BookingCard"

interface Booking {
  id: string
  status: string
  checkOut: string
  checkIn: string
  patient: string
  ownerId: string
  guests: number
  price: string
  finalPrice: string
  cleaning: string
  room: Room
  patientName?: string | null
  ownerName?: string | null
  discountStayAmount: string | null
  prepaymentPercentageApplied: 10
  prepaymentAmount: string | null
  balanceAmount: string | null
  balancePaymentDate: string | null
  bookingDateUpdated: string | null
  bookingDateCreated: string | null
  discountStayType: string | null
  discountPercentageStayApplied: number | null
  numberOfNights: number | null
  prepaymentDate: string | null
  fullAmount: string | null
  fullPaymentDate: string | null
  cancelledById: string | null
  cancelledByType: string | null
  cancelledDate: string | null
  cancelledMessage: string | null
  bookingState: string | null
  paymentState: string | null
}

interface Room {
  id: string
  name: string
  isPrivate: boolean
  bedType: "single" | "double"
  bedName?: string
  beds: number
  capacity: number
  description?: string
  doubleBeds?: number
  singleBeds?: number
  photos: Photo[]
  propertyId: Property
}



interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
}

interface Photo {
  directus_files_id: {
    id: string
  }
}

interface BookingSectionProps {
  title: string
  subtitle: string
  bookings: Booking[]
  isPast?: boolean
  gradientColor: string
  onCancelBooking?: (bookingId: string) => void
  onPayBalance?: (bookingId: string, balanceAmount: string) => void
  onReviewClick?: (bookingId: string, roomId: string) => void
}

const BookingSection: React.FC<BookingSectionProps> = ({
  title,
  subtitle,
  bookings,
  isPast = false,
  gradientColor,
  onCancelBooking,
  onPayBalance,
  onReviewClick,
}) => {
  if (bookings.length === 0) return null

  return (
    <section>
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0">
          <div className={`w-3 h-8 ${gradientColor} rounded-full`}></div>
        </div>
        <div className="ml-4">
          <h2 className={`text-2xl font-bold ${isPast ? "text-gray-700" : "text-gray-900"}`}>{title}</h2>
          <p className={`${isPast ? "text-gray-500" : "text-gray-600"}`}>{subtitle}</p>
        </div>
      </div>
      <ul className="space-y-6">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <BookingCard
              booking={booking}
              isPast={isPast}
              onCancelBooking={onCancelBooking}
              onPayBalance={onPayBalance}
              onReviewClick={onReviewClick}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BookingSection
