"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface RoomSearchProps {
  onSearch: (searchTerm: string) => void
}

export function RoomSearch({ onSearch }: RoomSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, onSearch])

  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Buscar por nombre, descripción o precio"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 w-full"
      />
    </div>
  )
}

