"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProvidersByUserId, type Provider } from "@/services/providerCollectionServiceEdit"
import { getCurrentUser } from "@/services/userService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, AlertCircle, Phone, Mail, MapPin, FileText, Pencil, Building2/*, Trash2*/ } from "lucide-react"
import { Fraunces } from "next/font/google"

const fraunces = Fraunces({ subsets: ["latin"] })
export default function ProviderDataPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null)


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

 {/* const handleDeleteService = (providerId: string) => {
    setProviderToDelete(providerId)
    setShowDeleteDialog(true)
  }*/}

  const confirmDelete = async () => {
    if (!providerToDelete) return

    try {
      // TODO: Implement actual delete API call
      console.log("Deleting provider:", providerToDelete)
      // After successful deletion, refresh the providers list
      setShowDeleteDialog(false)
      setProviderToDelete(null)
      // Refresh data
      const token = localStorage.getItem("access_token")
      if (token) {
        const currentUser = await getCurrentUser(token)
        const data = await getProvidersByUserId(currentUser.id, token)
        setProviders(data)
      }
    } catch (error) {
      console.error("Error al eliminar el servicio:", error)
    }
  }

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
                Registra tu servicio para pacientes y comienza a recibir reservas.
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
    <div className="container min-h-screen mx-auto p-4 py-8">
       <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>
                    Mi Servicio
              </h1>
      <div className="space-y-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="overflow-hidden border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className={`${fraunces.className} text-2xl font-normal text-[#162F40] mb-4`}>{provider.name}</CardTitle>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{provider.email}</span>
                  </div>
                </div>
             
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-6">{provider.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Tax ID/EIN</p>
                  <p className="font-semibold text-gray-900">{provider.taxIdEIN}</p>
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

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Teléfono</p>
                    <div className="flex items-center text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{provider.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Ubicación</p>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{`${provider.city}, ${provider.state}, ${provider.country}`}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-sm font-medium text-gray-500 mb-3">Archivos cargados</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">RNT</p>
                      <p className="text-xs text-gray-500">
                        {provider.RNTFile ? provider.RNTFile.filename_download : "No cargado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tax ID/EIN</p>
                      <p className="text-xs text-gray-500">
                        {provider.taxIdEINFile ? provider.taxIdEINFile.filename_download : "No cargado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push("/mi-panel/editar-servicio")}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  {/*<Button variant="destructive" size="sm" onClick={() => handleDeleteService(provider.id)}>
                    <Trash2 className="h-4 w-4" />
                    
                  </Button>*/}
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar servicio?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente tu servicio y cancelará cualquier suscripción activa. Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
