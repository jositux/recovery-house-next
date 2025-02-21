import { Check, X, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function ServiceLoadedPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <Check className="mr-2" size={24} />
            Servicio Cargado
          </CardTitle>
          <CardDescription className="text-blue-100"></CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-4">
            Has completado exitosamente el registro de tu servicio. Ahora puedes editarlo según tus necesidades.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 mb-2">Próximos pasos:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                Revisa la información de tu servicio
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                Actualiza tus detalles si es necesario
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                Mantén tu perfil actualizado para atraer más clientes
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 p-6">
          <div className="grid grid-cols-2 gap-4 w-full">
          <Link href="/" passHref className="w-full">
            <Button variant="outline" className="w-full">
              <X className="mr-2" size={16} />
              Salir
            </Button>
            </Link>
            <Link href="/editar-servicio" passHref className="w-full">
              <Button variant="default" className="w-full">
                <Edit className="mr-2" size={16} />
                Editar Servicio
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

