"use client"

import { useState, useMemo, useCallback } from 'react'
import { PropertyCard } from "@/components/ui/property-card"
import { Map } from "@/components/ui/map"
import { PropertySearch } from "@/components/ui/property-search"
import { propertiesData } from "./properties-data"

export default function PropertiesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const propertiesPerPage = 9

  const filteredProperties = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return propertiesData.properties.filter(property => 
      property.title.toLowerCase().includes(lowercasedSearchTerm) ||
      property.description.toLowerCase().includes(lowercasedSearchTerm) ||
      property.price.toString().includes(lowercasedSearchTerm)
    )
  }, [searchTerm])

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }, [])

  const indexOfLastProperty = currentPage * propertiesPerPage
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty)

  return (
    <main className="flex flex-col lg:flex-row min-h-screen">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#162F40] mb-6">
            Propiedades disponibles en Colombia
          </h1>
          <PropertySearch onSearch={handleSearch} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProperties.map((property) => (
              <div 
                key={property.id} 
                id={`property-${property.id}`}
              >
                <PropertyCard
                  id={property.id}
                  title={property.title}
                  description={property.description}
                  price={property.price}
                  image={property.image}
                />
              </div>
            ))}
          </div>
          {filteredProperties.length === 0 && (
            <p className="text-center text-[#162F40] mt-8">No se encontraron propiedades que coincidan con tu búsqueda.</p>
          )}
          {filteredProperties.length > 0 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full ${
                    page === currentPage ? 'bg-[#39759E] text-white' : 'bg-gray-200 text-[#162F40]'
                  } flex items-center justify-center`}
                  aria-label={`Página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-[400px] lg:h-auto">
        <Map properties={filteredProperties} />
      </div>
    </main>
  )
}

