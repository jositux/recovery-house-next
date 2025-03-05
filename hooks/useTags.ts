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

type ServicesTag = {
  id: string
  name: string
  icon: string
}

type ExtraTags = ExtraTag[] | null
type ServicesTags = ServicesTag[] | null

// Tipo para el objeto almacenado en localStorage
type StoredTagsData<T> = {
  tags: T
  timestamp: number
}

// Constante para el intervalo de actualización (8 horas en milisegundos)
const UPDATE_INTERVAL = 8 * 60 * 60 * 10 // 8 horas

// Hook para obtener y gestionar las etiquetas
const useTags = (
  extraTagsKey: string,
  serviceTagsKey: string,
  getExtraTags: () => Promise<ExtraTags>,
  getServiceTags: () => Promise<ServicesTags>,
) => {
  const [extraTags, setExtraTags] = useState<ExtraTags>(null)
  const [serviceTags, setServicesTags] = useState<ServicesTags>(null)

  useEffect(() => {
    const loadTags = async () => {
      try {
        const currentTime = Date.now()

        // Procesamos extraTags
        let shouldFetchExtraTags = true
        let parsedExtraTags: ExtraTags = null

        // Intentamos leer extraTags desde localStorage
        const storedExtraTags = localStorage.getItem(extraTagsKey)

        if (storedExtraTags) {
          const { tags, timestamp }: StoredTagsData<ExtraTags> = JSON.parse(storedExtraTags)

          console.log("Values ", currentTime - timestamp)
          console.log(UPDATE_INTERVAL)
          // Si no han pasado 8 horas, usamos los datos almacenados
          if (currentTime - timestamp < UPDATE_INTERVAL) {
            parsedExtraTags = tags
            shouldFetchExtraTags = false
            setExtraTags(parsedExtraTags)
          }
        }

        // Procesamos serviceTags
        let shouldFetchServiceTags = true
        let parsedServiceTags: ServicesTags = null

        // Intentamos leer serviceTags desde localStorage
        const storedServiceTags = localStorage.getItem(serviceTagsKey)

        if (storedServiceTags) {
          const { tags, timestamp }: StoredTagsData<ServicesTags> = JSON.parse(storedServiceTags)

          // Si no han pasado 8 horas, usamos los datos almacenados
          if (currentTime - timestamp < UPDATE_INTERVAL) {
            parsedServiceTags = tags
            shouldFetchServiceTags = false
            setServicesTags(parsedServiceTags)
          }
        }

        // Obtenemos extraTags desde la API si es necesario
        if (shouldFetchExtraTags) {
          const fetchedExtraTags = await getExtraTags()
          setExtraTags(fetchedExtraTags)

          // Guardamos los datos junto con el timestamp actual
          const dataToStore: StoredTagsData<ExtraTags> = {
            tags: fetchedExtraTags,
            timestamp: currentTime,
          }

          localStorage.setItem(extraTagsKey, JSON.stringify(dataToStore))
        }

        // Obtenemos serviceTags desde la API si es necesario
        if (shouldFetchServiceTags) {
          const fetchedServiceTags = await getServiceTags()
          setServicesTags(fetchedServiceTags)

          // Guardamos los datos junto con el timestamp actual
          const dataToStore: StoredTagsData<ServicesTags> = {
            tags: fetchedServiceTags,
            timestamp: currentTime,
          }

          localStorage.setItem(serviceTagsKey, JSON.stringify(dataToStore))
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

