import CalendarView from "./calendar"

export default function CalendarPage() {
  // Aquí podrías obtener el ID de la habitación de los parámetros de la URL o de otro lugar
  const roomId = "1" // ID de ejemplo

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      <CalendarView roomId={roomId} />
    </main>
  )
}
