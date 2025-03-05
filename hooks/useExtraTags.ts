"use client"

import { useState, useEffect } from "react"

// Definimos los tipos de las etiquetas
type ExtraTag = {
  id: string
  name: string
  icon: string
  enable_property: boolean
  enable_services: boolean
}

type ExtraTags = ExtraTag[] | null

// Tipo para el objeto almacenado en localStorage
type StoredTagsData = {
  tags: ExtraTags
  timestamp: number
}

// Constante para el intervalo de actualización (8 horas en milisegundos)
const UPDATE_INTERVAL = 8 * 60 * 60 * 100 // 8 horas

// Hook para obtener y gestionar las etiquetas
const useTags = (extraTagsKey: string, getExtraTags: () => Promise<ExtraTags>) => {
  const [extraTags, setExtraTags] = useState<ExtraTags>(null)

  useEffect(() => {
    const loadTags = async () => {
      try {
        // Intentamos leer desde localStorage
        const storedData = localStorage.getItem(extraTagsKey)

        let shouldFetchFromAPI = true
        let parsedExtraTags: ExtraTags = null

        // Verificamos si hay datos almacenados y si no han pasado 8 horas
        if (storedData) {
          const { tags, timestamp }: StoredTagsData = JSON.parse(storedData)

          console.log("datos", tags)
          const currentTime = Date.now()

          // Si no han pasado 8 horas, usamos los datos almacenados
          if (currentTime - timestamp < UPDATE_INTERVAL) {
            parsedExtraTags = tags
            shouldFetchFromAPI = false
           
          }
        }


        // Si no hay datos válidos en localStorage o han pasado 8 horas, obtenemos desde la API
        if (shouldFetchFromAPI) {
          const fetchedExtraTags = await getExtraTags()
          setExtraTags(fetchedExtraTags)

          // Guardamos los datos junto con el timestamp actual
          const dataToStore: StoredTagsData = {
            tags: fetchedExtraTags,
            timestamp: Date.now(),
          }

          localStorage.setItem(extraTagsKey, JSON.stringify(dataToStore))
        } else {
          // Usamos los datos del localStorage
          setExtraTags(parsedExtraTags)
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

