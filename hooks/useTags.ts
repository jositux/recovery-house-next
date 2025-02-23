import { useState, useEffect } from 'react'

// Definimos los tipos de las etiquetas
type ExtraTag = { 
  id: string; 
  name: string; 
  icon: string; 
  enable_property: boolean; 
  enable_services: boolean; 
}

type ServicesTag = { 
  id: string; 
  name: string; 
  icon: string; 
}

type ExtraTags = ExtraTag[] | null
type ServicesTags = ServicesTag[] | null

// Hook para obtener y gestionar las etiquetas
const useTags = (
  extraTagsKey: string,
  serviceTagsKey: string,
  getExtraTags: () => Promise<ExtraTags>,
  getServiceTags: () => Promise<ServicesTags>
) => {
  const [extraTags, setExtraTags] = useState<ExtraTags>(null)
  const [serviceTags, setServicesTags] = useState<ServicesTags>(null)

  useEffect(() => {
    const loadTags = async () => {
      try {
        // Intentamos leer desde localStorage
        const storedExtraTags = localStorage.getItem(extraTagsKey)
        const storedServiceTags = localStorage.getItem(serviceTagsKey)

        // Parseamos solo si no es null
        const parsedExtraTags = storedExtraTags ? JSON.parse(storedExtraTags) : null
        const parsedServiceTags = storedServiceTags ? JSON.parse(storedServiceTags) : null

        // Si no se encuentran en el localStorage, obtenemos los datos desde la API
        const fetchedExtraTags = parsedExtraTags || await getExtraTags()
        const fetchedServiceTags = parsedServiceTags || await getServiceTags()
        localStorage.setItem(extraTagsKey, JSON.stringify(fetchedExtraTags))
        localStorage.setItem(serviceTagsKey, JSON.stringify(fetchedServiceTags))

        // Guardamos los resultados en el estado
        setExtraTags(fetchedExtraTags)
        setServicesTags(fetchedServiceTags)

        // Guardamos los datos en el localStorage para futuros usos
        if (!parsedExtraTags) {
          localStorage.setItem(extraTagsKey, JSON.stringify(fetchedExtraTags))
        }
        if (!parsedServiceTags) {
          localStorage.setItem(serviceTagsKey, JSON.stringify(fetchedServiceTags))
        }
      } catch (error) {
        console.error("Error loading tags:", error)
      }
    }
    loadTags()
  }, [extraTagsKey, serviceTagsKey, getExtraTags, getServiceTags])

  return { extraTags, serviceTags }
}

export default useTags
