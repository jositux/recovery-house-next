"use client"

import type React from "react"
import { useEffect, useState } from "react"
// Importamos useParams para obtener el idioma de la URL
import { useRouter, useParams } from "next/navigation" 
import { getPropertiesByUserId, type Property } from "@/services/propertyCollectionService"
import { getCurrentUser, type User } from "@/services/userService"
// Asumiendo que estos componentes están disponibles en el entorno de Canvas
import { Card, CardContent } from "@/components/ui/card" 
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Loader2, BedDouble, Building2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Fraunces } from "next/font/google"
import { getAssetUrl } from "@/lib/getAssetUrl";

const fraunces = Fraunces({ subsets: ["latin"] })

// Definición simple de tipos de idioma para referencia
type Locale = 'es' | 'en'; 

// --- Objeto de traducción simple (T_MAP) ---
const T_MAP = {
    'Token no encontrado. Inicia sesión nuevamente.': { es: 'Token no encontrado. Inicia sesión nuevamente.', en: 'Token not found. Please log in again.' },
    'Error inesperado': { es: 'Error inesperado', en: 'Unexpected error' },
    'Cargando propiedades...': { es: 'Cargando propiedades...', en: 'Loading properties...' },
    'Error:': { es: 'Error:', en: 'Error:' },
    'Aún no has registrado una propiedad': { es: 'Aún no has registrado una propiedad', en: 'You have not registered a property yet' },
    'Dar el primer paso para convertirte en anfitrión puede ser el comienzo de una experiencia increíble.': { 
        es: 'Dar el primer paso para convertirte en anfitrión puede ser el comienzo de una experiencia increíble.', 
        en: 'Taking the first step to become a host can be the start of an amazing experience.' 
    },
    'Agregar Propiedad': { es: 'Agregar Propiedad', en: 'Add Property' },
    'Mis Propiedades': { es: 'Mis Propiedades', en: 'My Properties' },
    'Nueva Propiedad': { es: 'Nueva Propiedad', en: 'New Property' },
    'Sin descripción': { es: 'Sin descripción', en: 'No description' },
    'habitación': { es: 'habitación', en: 'room' },
    'habitaciones': { es: 'habitaciones', en: 'rooms' },
    'Ver detalles': { es: 'Ver detalles', en: 'View details' },
    'Aprobado': { es: 'Aprobado', en: 'Approved' },
    'En Revisión': { es: 'En Revisión', en: 'In Review' },
};

// Función de traducción
const t = (key: string, lang: Locale): string => {
  // Si la key es una key real del map
  if (key in T_MAP) {
    const typedKey = key as keyof typeof T_MAP;
    return T_MAP[typedKey][lang] ?? key;
  }

  // Si no existe en el mapa, devolvemos el string tal cual
  return key;
};
// --- Fin T_MAP ---

const PropertiesPage: React.FC = () => {
  const router = useRouter()
  // 1. Obtener el idioma de la URL usando useParams()
  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Default to 'es' if not found

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          // Redirección en el cliente
          router.push(`/${lang}/login`)
          return
        }

        const currentUser: User = await getCurrentUser(token)
        const data = await getPropertiesByUserId(currentUser.id, token)

        setProperties(data)
        // Mantenemos localStorage para persistencia de propiedades, si es necesario
        localStorage.setItem("properties", JSON.stringify(data)) 
      } catch (err: unknown) {
        if (err instanceof Error) {
          // Aplicamos traducción al mensaje de error del token
          const errorKey: keyof typeof T_MAP = err.message as keyof typeof T_MAP;
          setError(t(errorKey, lang))
        } else {
          // Aplicamos traducción al error inesperado
          setError(t("Error inesperado", lang))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, lang]) // Añadimos 'lang' como dependencia

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {/* Aplicamos traducción al mensaje de carga */}
        <span className="ml-2 text-lg text-gray-700">{t("Cargando propiedades...", lang)}</span>
      </div>
    )
  }

  if (error) {
    return <p className="text-center p-4 text-red-500">{t("Error:", lang)} {error}</p>
  }

  const decodeHtmlAndRemoveTags = (html: string): string => {
    const textWithoutTags = html.replace(/<\/?[^>]+(>|$)/g, "")
    const txt = document.createElement("textarea")
    txt.innerHTML = textWithoutTags
    return txt.value
  }

  // Helper para pluralización de habitaciones
  const getRoomText = (count: number, lang: Locale) => {
    if (count === 1) {
      return `1 ${t('habitación', lang)}`
    }
    return `${count || 0} ${t('habitaciones', lang)}`
  }

  return (
    <div className="container min-h-screen mx-auto py-4">
      
      {properties.length === 0 ? (
       
          <div className="container min-h-screen mx-auto p-4 py-4">
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col items-center justify-center text-center space-y-8 py-16">
                <div className="w-20 h-20 rounded-full bg-[#39759E]/10 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-[#39759E]" />
                </div>
    
                <div className="space-y-3">
                <h1
            className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-8`}
          >
             {/* Aplicamos traducción */}
             {t("Aún no has registrado una propiedad", lang)}
          </h1>
                  <p className="text-base text-gray-600 max-w-md mx-auto">
                   {/* Aplicamos traducción */}
                   {t("Dar el primer paso para convertirte en anfitrión puede ser el comienzo de una experiencia increíble.", lang)}
                  </p>
                </div>
    
                <Button
                  size="lg"
                  className="mt-4 px-8 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#39759E" }}
                  onClick={() => router.push(`/${lang}/mi-panel/registrar-propiedad`)}
                >
                 <Plus className="mr-2 h-5 w-5" /> {t("Agregar Propiedad", lang)}
                </Button>
              </div>
            </div>
          </div>
        
      ) : (
        <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>
                    {t("Mis Propiedades", lang)}
              </h1>
        <Link href={`/${lang}/mi-panel/registrar-propiedad`} className="w-full sm:w-auto"> {/* Aseguramos que el Link mantenga el idioma */}
          <Button className="w-full sm:w-auto bg-[#39759E] text-white hover:bg-[#2c5a7a] transition-colors duration-300">
            <Plus className="mr-2 h-5 w-5" /> {t("Nueva Propiedad", lang)}
          </Button>
        </Link>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-2/5 h-48 sm:h-auto">
                  <Link href={`/${lang}/mi-panel/propiedades/${property.id}`}> {/* Aseguramos que el Link mantenga el idioma */}
                    <Image
                      src={getAssetUrl(property.mainImage || "/placeholder.svg", "medium")}
                      alt={property.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 100vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                </div>
                <CardContent className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                    <h2 className={`${fraunces.className} text-2xl font-normal text-[#162F40] mb-4`}>
                    {property.name}
              </h2>
                 
                    </div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.country}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {/* Aplicamos traducción */}
                      {decodeHtmlAndRemoveTags(property.description) || t("Sin descripción", lang)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <BedDouble className="h-4 w-4 mr-1" />
                      {/* Aplicamos traducción y lógica de pluralización */}
                      {getRoomText(property.Rooms?.length || 0, lang)}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="space-x-2">
                      <Link href={`/${lang}/mi-panel/propiedades/${property.id}`}> {/* Aseguramos que el Link mantenga el idioma */}
                        <Button variant="outline" size="sm">
                          {t("Ver detalles", lang)}
                        </Button>
                      </Link>
                    </div>
                    {property.taxIdApproved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t("Aprobado", lang)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {t("En Revisión", lang)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
        </div>
      )}
    </div>
  )
}

export default PropertiesPage