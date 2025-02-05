import { useState } from "react"
import { Check } from "lucide-react"
import type React from "react" // Added import for React

interface Procedure {
  name: string
  icon: string
}

interface MultiSelectButtonsProps {
  onChange: (selectedNames: string[]) => void
}

const procedures: Procedure[] = [
  { name: "Cirugía plástica", icon: "/assets/icons/00.svg" },
  { name: "Cirugía bariátrica", icon: "/assets/icons/01.svg" },
  { name: "Implante capilar", icon: "/assets/icons/02.svg" },
  { name: "Salud mental", icon: "/assets/icons/03.svg" },
  { name: "Rehabilitación", icon: "/assets/icons/04.svg" },
  { name: "Otro", icon: "/assets/icons/05.svg" },
]

export function MultiSelectCase({ onChange }: MultiSelectButtonsProps) {
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])

  const toggleProcedure = (name: string) => {
    setSelectedProcedures((prev) => {
      const newSelection = prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
      onChange(newSelection)
      return newSelection
    })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {procedures.map((procedure) => (
        <button
          type="button"
          key={procedure.name}
          onClick={() => toggleProcedure(procedure.name)}
          className={`p-2 rounded-lg border-[1px] transition-all duration-200 ease-in-out text-left ${
            selectedProcedures.includes(procedure.name) ? "border-[#39759E] bg-blue-50" : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-start">
            <img src={procedure.icon} alt={procedure.name} className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <h3 className="font-normal text-sm py-2">{procedure.name}</h3>
            </div>
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full border-[1px] flex items-center mt-2 justify-center ${
                selectedProcedures.includes(procedure.name) ? "border-[#39759E] bg-[#39759E]" : "border-gray-300"
              }`}
            >
              {selectedProcedures.includes(procedure.name) && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
