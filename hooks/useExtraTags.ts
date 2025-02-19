import { useState, useEffect } from 'react'

// Definimos los tipos de las etiquetas
type ExtraTag = { 
  id: string; 
  name: string; 
  icon: string; 
  enable_property: boolean; 
  enable_services: boolean; 
}

type ExtraTags = ExtraTag[] | null


// Hook para obtener y gestionar las etiquetas
const useTags = (
  extraTagsKey: string,

  getExtraTags: () => Promise<ExtraTags>,

) => {
  const [extraTags, setExtraTags] = useState<ExtraTags>(null)

  useEffect(() => {
    const loadTags = async () => {
      try {
        // Intentamos leer desde localStorage
        const storedExtraTags = localStorage.getItem(extraTagsKey)

        // Parseamos solo si no es null
        const parsedExtraTags = storedExtraTags ? JSON.parse(storedExtraTags) : null

        // Si no se encuentran en el localStorage, obtenemos los datos desde la API
        const fetchedExtraTags = parsedExtraTags || await getExtraTags()

        // Guardamos los resultados en el estado
        setExtraTags(fetchedExtraTags)

        // Guardamos los datos en el localStorage para futuros usos
        if (!parsedExtraTags) {
          localStorage.setItem(extraTagsKey, JSON.stringify(fetchedExtraTags))
        }

      } catch (error) {
        console.error("Error loading tags:", error)
      }
    }
    loadTags()
  }, [extraTagsKey, getExtraTags])

  return { extraTags }
}

export default useTags
