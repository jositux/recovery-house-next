"use client"

import { useCallback, useMemo } from "react"
import { Check } from "lucide-react"
import Image from "next/image" // Importamos Image para el uso recomendado en Next.js

// 🛑 Interfaz de procedimiento actualizada con ambos idiomas
interface Procedure {
  name_es: string
  name_en: string
  icon: string
}

interface MultiSelectButtonsProps {
  value: string[] | string
  onChange: (selectedNames: string[]) => void
  // 🛑 NUEVO PROP: Idioma
  lang: string 
}

// 🛑 Lista maestra de procedimientos con traducciones (usando name_es como clave)
const ALL_PROCEDURES: Procedure[] = [
  { name_es: "Cirugía plástica", name_en: "Plastic surgery", icon: "/assets/icons/00.svg" },
  { name_es: "Cirugía bariátrica", name_en: "Bariatric surgery", icon: "/assets/icons/01.svg" },
  { name_es: "Implante capilar", name_en: "Hair transplant", icon: "/assets/icons/02.svg" },
  { name_es: "Salud mental", name_en: "Mental health", icon: "/assets/icons/03.svg" },
  { name_es: "Rehabilitación", name_en: "Rehabilitation", icon: "/assets/icons/04.svg" },
  { name_es: "Otro", name_en: "Other", icon: "/assets/icons/05.svg" },
]

// Función auxiliar para obtener el nombre traducido
const getTranslatedName = (procedure: Procedure, isSpanish: boolean) => {
    return isSpanish ? procedure.name_es : procedure.name_en
}

// 🛑 RECIBIR EL PROP 'lang'
export function MultiSelectCase({ value, onChange, lang }: MultiSelectButtonsProps) {
  
  const isSpanish = lang === "es"

  // 🛑 Usamos useMemo para obtener la lista de procedimientos traducidos a mostrar en la UI
  const proceduresToDisplay = useMemo(() => {
    return ALL_PROCEDURES.map(p => ({
        ...p,
        // El nombre visible en la UI será el traducido
        displayName: getTranslatedName(p, isSpanish),
        // La clave de selección (el valor que guardaremos en 'value' y en el URL)
        // debe ser consistente. Usaremos siempre el nombre en español (name_es) como clave.
        selectionKey: p.name_es 
    }))
  }, [isSpanish])


  // Se mantiene la lógica de "safeValue" pero ahora nos aseguramos de que los valores 
  // que lee (del URL o prop) sean las claves de selección (name_es).
  const safeValue = useMemo(() => {
    let result: string[] = []
    if (Array.isArray(value)) result = value
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          // Asumimos que si viene de JSON/string, ya son las claves (name_es)
          result = parsed.map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
        }
      } catch {
        // Si es una cadena simple, la tratamos como una sola clave
        result = [value]
      }
    }
    // Nos aseguramos de que solo haya claves válidas (name_es)
    const validKeys = ALL_PROCEDURES.map(p => p.name_es);
    return result.filter(key => validKeys.includes(key));

  }, [value])

  const toggleProcedure = useCallback(
    // 🛑 Recibe la CLAVE DE SELECCIÓN (siempre name_es)
    (selectionKey: string) => {
      const newSelection = safeValue.includes(selectionKey) 
        ? safeValue.filter((item) => item !== selectionKey) 
        : [...safeValue, selectionKey]
      onChange(newSelection)
    },
    [safeValue, onChange],
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {/* Iteramos sobre la lista traducida para la UI */}
      {proceduresToDisplay.map((procedure) => (
        <button
          type="button"
          key={procedure.selectionKey} // Usamos la clave de selección para la clave de React
          // 🛑 Al hacer click, pasamos la clave de selección (name_es)
          onClick={() => toggleProcedure(procedure.selectionKey)}
          className={`p-2 rounded-lg border-[1px] transition-all duration-200 ease-in-out text-left ${
            // 🛑 Comprobamos si la CLAVE DE SELECCIÓN está en la lista de valores guardados
            safeValue.includes(procedure.selectionKey) ? "border-[#39759E] bg-blue-50" : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-start">
            {/* Usamos el componente Image para un mejor rendimiento */}
            <Image
              src={procedure.icon || "/placeholder.svg"}
              alt={procedure.displayName}
              width={24}
              height={24}
              className="w-6 h-6 mr-3 mt-1 flex-shrink-0"
            />
            <div className="flex-grow">
              {/* 🛑 Mostramos el nombre traducido */}
              <h3 className="font-normal text-sm py-2">{procedure.displayName}</h3> 
            </div>
            <div
                className={`
                    hidden sm:flex 
                    flex-shrink-0 w-5 h-5 rounded-full border-[1px] flex items-center mt-2 justify-center 
                    ${safeValue.includes(procedure.selectionKey) ? "border-[#39759E] bg-[#39759E]" : "border-gray-300"}
                `}
            >
                {safeValue.includes(procedure.selectionKey) && <Check className="w-3 h-3 text-white" />}
            </div>

          </div>
        </button>
      ))}
    </div>
  )
}