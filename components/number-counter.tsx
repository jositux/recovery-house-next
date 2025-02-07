"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NumberCounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function NumberCounter({ value, onChange, min = 1, max = 16 }: NumberCounterProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full border-gray-300"
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-4 text-center">{value}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full border-gray-300"
        onClick={() => value < max && onChange(value + 1)}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

