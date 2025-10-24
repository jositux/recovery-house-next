export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#39759E] border-t-transparent" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
