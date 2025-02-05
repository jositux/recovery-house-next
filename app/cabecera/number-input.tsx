"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Minus } from 'lucide-react'

interface NumberInputProps {
  min?: number
  max?: number
  defaultValue?: number
  onChange?: (value: number) => void
}

export function NumberInput({ min = 1, max = 50, defaultValue = 1, onChange }: NumberInputProps) {
  const [value, setValue] = useState(defaultValue)

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1)
    setValue(newValue)
    onChange?.(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1)
    setValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="flex items-center space-x-4">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-6 h-6 rounded-full border-gray-400 text-[#162F40] hover:bg-gray-200"
      >
        <Minus className="h-5 w-5" />
      </Button>

      {/* Contenedor con ancho fijo para evitar movimiento */}
      <div className="w-8 text-center text-xl font-medium">
        {value}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-6 h-6 rounded-full border-gray-400 text-[#162F40] hover:bg-gray-200"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  )
}
