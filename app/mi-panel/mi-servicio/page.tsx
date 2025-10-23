"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProvidersByUserId, type Provider } from "@/services/providerCollectionServiceEdit"
import { getCurrentUser } from "@/services/userService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Phone, Mail, MapPin, FileText, Pencil, Building2 } from "lucide-react"

export default function ProviderDataPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const currentUser = await getCurrentUser(token)
        const data = await getProvidersByUserId(currentUser.id, token)
        setProviders(data)
      } catch (error) {
        console.error("Error al cargar los datos del proveedor:", error)
        setError("Error al cargar los datos del proveedor. Por favor, intente de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchData()
  }, [router])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  if (providers.length === 0) {
    return (
      <div className="container min-h-screen mx-auto p-4 py-16">
        <div className="max-w-xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-16">
            <div className="w-20 h-20 rounded-full bg-[#39759E]/10 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-[#39759E]" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Aún no has registrado ningún servicio
              </h1>
              <p className="text-base text-gray-600 max-w-md mx-auto">
              Registra tu servicio y comienza a brindar apoyo a quienes lo necesitan.
              </p>
            </div>

            <Button
              size="lg"
              className="mt-4 px-8 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#39759E" }}
              onClick={() => router.push("/mi-panel/registrar-servicio")}
            >
              Registrar mi Servicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container min-h-screen mx-auto p-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Mi Servicio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="overflow-hidden relative">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-[#39759E] text-white">
              <CardTitle className="text-xl">{provider.name}</CardTitle>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-white" />
                <span>{provider.email}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">{provider.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold">Tax ID/EIN: {provider.taxIdEIN}</p>
                  {provider.taxIdApproved ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aprobado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      En Revisión
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{provider.phone}</span>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{`${provider.city}, ${provider.state}, ${provider.country}`}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Archivos cargados:</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span>RNT: {provider.RNTFile ? provider.RNTFile.filename_download : "No cargado"}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span>
                      Tax ID/EIN: {provider.taxIdEINFile ? provider.taxIdEINFile.filename_download : "No cargado"}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="absolute bottom-4 right-4 bg-transparent"
                onClick={() => {
                  router.push("/editar-servicio")
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
