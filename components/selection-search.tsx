"use client"

import { useState, useEffect, useRef } from "react"
import { Check } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface SelectionSearchProps {
  initialSelected?: string[]
  onChange?: (selectedIds: string[]) => void
}

type SelectionKey = "all" | "nurse" | "coordinator" | "food" | "transportation";

const spanishLabels: { [key in SelectionKey]: string } = {
  all: "Todo incluido",
  nurse: "Enfermera",
  coordinator: "Coordinador",
  food: "Comida",
  transportation: "Transporte"
}

export default function SelectionSearch({ initialSelected = [], onChange }: SelectionSearchProps) {
  const [selections, setSelections] = useState<{ [key in SelectionKey]: boolean }>(() => {
    const initialState: { [key in SelectionKey]: boolean } = {
      all: false,
      nurse: false,
      coordinator: false,
      food: false,
      transportation: false,
    }

    initialSelected.forEach((key) => {
      if (key in initialState) {
        initialState[key as SelectionKey] = true
      }
    })

    return initialState
  })

  const prevSelectionsRef = useRef<{ [key in SelectionKey]: boolean }>(selections);

  const handleSelection = (key: SelectionKey) => {
    let newSelections: { [key in SelectionKey]: boolean }

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
    if (JSON.stringify(selections) !== JSON.stringify(prevSelectionsRef.current)) {
      const newSelectedIds = Object.keys(selections).filter((key) => selections[key as SelectionKey]);
      onChange?.(newSelectedIds);
      prevSelectionsRef.current = selections;
    }
  }, [selections, onChange]);

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        variant="outline"
        className={`flex text-sm items-center justify-between gap-2 rounded-full pl-4 pr-2 h-10 min-w-[140px] ${
          selections.all ? "bg-[white] text-[#162F40] hover:bg-[white] border-[#162F40]" : "hover:bg-white"
        }`}
        onClick={() => handleSelection("all")}
      >
        <span>{spanishLabels.all}</span>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            selections.all ? "bg-[#162F40]" : "bg-[#e2e8f0]"
          }`}
        >
          <Check className={`h-4 w-4 ${selections.all ? "text-[white]" : "text-white"}`} />
        </div>
      </Button>

      {(["nurse", "coordinator", "food", "transportation"] as SelectionKey[]).map((item) => (
        <Button
          key={item}
          variant="outline"
          className={`flex items-center justify-between gap-2 rounded-full pl-4 pr-2 h-10 ${
            selections[item] ? "border-[#3b82f6] text-[#3b82f6]" : "border-[#e2e8f0]"
          } hover:bg-transparent hover:text-inherit`}
          onClick={() => handleSelection(item)}
        >
          {spanishLabels[item]}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              selections[item] ? "bg-[#162F40]" : "bg-[#D2EFFF]"
            }`}
          >
            <Check className={`h-4 w-4 ${selections[item] ? "text-white" : "text-white"}`} />
          </div>
        </Button>
      ))}
    </div>
  )
}
