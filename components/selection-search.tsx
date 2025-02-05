"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SelectionSearchProps {
  initialSelected?: string[]
  onChange?: (selectedIds: string[]) => void
}

type SelectionKey = "all" | "nurse" | "coordinator" | "food" | "transportation";

export default function SelectionSearch({ initialSelected = ["all"], onChange }: SelectionSearchProps) {
  const [selections, setSelections] = useState<{ [key in SelectionKey]: boolean }>({
    all: false,
    nurse: false,
    coordinator: false,
    food: false,
    transportation: false,
  });

  const handleSelection = (key: SelectionKey) => {
    let newSelections: { [key in SelectionKey]: boolean };

    if (key === "all") {
      newSelections = {
        all: !selections.all,
        nurse: false,
        coordinator: false,
        food: false,
        transportation: false,
      }
    } else {
      newSelections = {
        ...selections,
        all: false,
        [key]: !selections[key],
      }
    }

    setSelections(newSelections)
  }

  useEffect(() => {
    const newSelectedIds = Object.entries(selections)
      .filter(([key, value]) => value)
      .map(([key]) => key)

    console.log("Selected IDs:", newSelectedIds)
    onChange?.(newSelectedIds)
  }, [selections, onChange])

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        variant="outline"
        className={`flex items-center justify-between gap-2 rounded-full pl-4 pr-2 h-10 min-w-[140px] ${
          selections.all ? "bg-[white] text-[#162F40] hover:bg-[white] border-[#162F40]" : "hover:bg-white"
        }`}
        onClick={() => handleSelection("all")}
      >
        <span>Todo incluido</span>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            selections.all ? "bg-[#162F40]" : "bg-[#e2e8f0]"
          }`}
        >
          <Check className={`h-4 w-4 ${selections.all ? "text-[white]" : "text-white"}`} />
        </div>
      </Button>

      {["nurse", "coordinator", "food", "transportation"].map((item) => (
        <Button
          key={item}
          variant="outline"
          className={`flex items-center justify-between gap-2 rounded-full pl-4 pr-2 h-10 ${
            selections[item as keyof typeof selections] ? "border-[#3b82f6] text-[#3b82f6]" : "border-[#e2e8f0]"
          } hover:bg-transparent hover:text-inherit`}
          onClick={() => handleSelection(item as SelectionKey)} // Hacemos un 'cast' a 'SelectionKey'
        >
          {item.charAt(0).toUpperCase() + item.slice(1)}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              selections[item as keyof typeof selections] ? "bg-[#162F40]" : "bg-[#D2EFFF]"
            }`}
          >
            <Check className={`h-4 w-4 ${selections[item as keyof typeof selections] ? "text-white" : "text-white"}`} />
          </div>
        </Button>
      ))}
    </div>
  )
}
