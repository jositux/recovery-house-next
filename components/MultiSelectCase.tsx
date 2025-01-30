import { useState } from "react"
import { Check, Stethoscope, Brain, TreesIcon as Lungs, Syringe, Dna, UserCog } from "lucide-react"
import type React from "react" // Added import for React

interface Option {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

interface MultiSelectButtonsProps {
  onChange: (selectedIds: string[]) => void
}

const options: Option[] = [
  {
    id: "postoperatorios",
    title: "Postoperatorios y traumatológicos",
    description: "Recuperación de cirugías, fracturas, reemplazos articulares y lesiones musculoesqueléticas.",
    icon: Stethoscope,
  },
  {
    id: "neurologicos",
    title: "Neurológicos y psiquiátricos",
    description:
      "Atención a condiciones como ACV, Parkinson, Alzheimer, esclerosis múltiple y trastornos mentales en rehabilitación.",
    icon: Brain,
  },
  {
    id: "cardiorrespiratorios",
    title: "Cardiorrespiratorios",
    description:
      "Cuidados para insuficiencia cardíaca, recuperación post-infarto, hipertensión severa y enfermedades pulmonares crónicas.",
    icon: Lungs,
  },
  {
    id: "oncologicos",
    title: "Oncológicos y paliativos",
    description: "Atención a pacientes en tratamiento o recuperación de cáncer y cuidados para enfermedades avanzadas.",
    icon: Syringe,
  },
  {
    id: "metabolicos",
    title: "Metabólicos y autoinmunes",
    description: "Manejo de diabetes complicada, insuficiencia renal, obesidad y enfermedades autoinmunes.",
    icon: Dna,
  },
  {
    id: "geriatricos",
    title: "Geriátricos y crónicos",
    description:
      "Atención integral a adultos mayores con múltiples condiciones, movilidad reducida y necesidades especiales.",
    icon: UserCog,
  },
]

export function MultiSelectCase({ onChange }: MultiSelectButtonsProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) => {
      const newSelection = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      onChange(newSelection)
      return newSelection
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          onClick={() => toggleOption(option.id)}
          className={`p-4 rounded-lg border-2 transition-all duration-200 ease-in-out text-left ${
            selectedOptions.includes(option.id) ? "border-[#4A7598] bg-blue-50" : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-start">
            <option.icon className="w-6 h-6 mr-3 mt-1 text-blue-500 flex-shrink-0" />
            <div className="flex-grow">
              <h3 className="font-semibold text-lg">{option.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </div>
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedOptions.includes(option.id) ? "border-[#4A7598] bg-[#4A7598]" : "border-gray-300"
              }`}
            >
              {selectedOptions.includes(option.id) && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

