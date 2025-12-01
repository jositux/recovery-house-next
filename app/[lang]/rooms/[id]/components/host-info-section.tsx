interface HostInfoSectionProps {
  hostName?: string
  guestComments?: string
}

export function HostInfoSection({ hostName, guestComments }: HostInfoSectionProps) {
  if (!hostName && !guestComments) return null

  return (
    <>
      {/* Sección de Anfitrión */}
      {hostName && (
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {hostName.charAt(0).toUpperCase()}
            </div>
            <div>
                 <p className="text-gray-700">{hostName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Comentarios */}
      {guestComments && (
        
          <p className="text-gray-700 mb-16">{guestComments}</p>
       
      )}
    </>
  )
}
