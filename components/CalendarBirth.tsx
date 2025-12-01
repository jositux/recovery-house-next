
"use client"

import { useState, useEffect } from "react"
import { subYears, isAfter, startOfDay } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormLabel } from "@/components/ui/form"
import { type Locale } from '@/lib/i18n';

// --- Configuración de Traducciones (Ejemplo) ---
type TranslationKeys = {
  months: string[];
  year: string;
  month: string;
  day: string;
};

// Asumiendo que 'Locale' podría ser 'es' | 'en' | 'fr', etc.
// Nota: Solo se incluyen 'es' y 'en' como ejemplo funcional.
const translations: Record<Locale, TranslationKeys> = {
  es: {
    months: [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ],
    year: "Año",
    month: "Mes",
    day: "Día",
  },
  en: {
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    year: "Year",
    month: "Month",
    day: "Day",
  },
  // Agrega más idiomas según tu 'Locale'
};
// ----------------------------------------------


const TODAY = startOfDay(new Date())
// Define la fecha mínima de nacimiento (18 años atrás)
const MIN_BIRTH_DATE = subYears(TODAY, 18) 
const CURRENT_YEAR = TODAY.getFullYear()

interface CalendarBirthProps {
  onChange: (date: string) => void
  initialValue?: string
  // Nuevo parámetro de internacionalización
  lang: Locale 
}

export function CalendarBirth({ onChange, initialValue, lang }: CalendarBirthProps) {
  const [year, setYear] = useState<string>("")
  const [month, setMonth] = useState<string>("")
  const [day, setDay] = useState<string>("")
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)

  // Selecciona las traducciones basadas en el idioma proporcionado
  const T = translations[lang] || translations.es; 
  const MONTHS = T.months; // Usa la lista de meses traducida

  // 1. Manejo de valores iniciales
  useEffect(() => {
    if (initialValue && isFirstRender) {
      setTimeout(() => {
        const [y, m, d] = initialValue.split("-")
        if (y && m && d) {
          setYear(y)
          setMonth(m)
          setDay(d)
        }
        setIsFirstRender(false)
      }, 1000)
    }
  }, [initialValue, isFirstRender])

  // 2. Sincronización de los cambios con la función `onChange`
  useEffect(() => {
    if (year && month && day) {
      // Formato YYYY-MM-DD
      onChange(`${year}-${month}-${day}`)
    }
  }, [year, month, day, onChange])

  // 3. Generación de años (solo hasta la fecha mínima de nacimiento)
  const years = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => (CURRENT_YEAR - i).toString()).filter(
    (y) => !isAfter(new Date(Number.parseInt(y), 11, 31), MIN_BIRTH_DATE),
  )

  // 4. Lógica para limitar los meses si se selecciona el año mínimo
  const getMonths = (selectedYear: string) => {
    if (Number.parseInt(selectedYear) === MIN_BIRTH_DATE.getFullYear()) {
      return MONTHS.slice(0, MIN_BIRTH_DATE.getMonth() + 1)
    }
    return MONTHS
  }

  // 5. Lógica para calcular los días disponibles
  const getDays = (selectedYear: string, selectedMonth: string) => {
    if (!selectedYear || !selectedMonth) return []
    const monthIndex = Number.parseInt(selectedMonth) - 1
    const daysInMonth = new Date(Number.parseInt(selectedYear), monthIndex + 1, 0).getDate()
    const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0"))

    // Ajustar para las restricciones de la fecha mínima de nacimiento
    if (
      Number.parseInt(selectedYear) === MIN_BIRTH_DATE.getFullYear() && 
      monthIndex === MIN_BIRTH_DATE.getMonth()
    ) {
      return days.slice(0, MIN_BIRTH_DATE.getDate())
    }
    return days
  }

  // El comentario sobre `useEffect` para recalcular días está bien. Lo dejo comentado como estaba.

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <FormLabel>{T.year}</FormLabel>
        <Select onValueChange={setYear} value={year || ""}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={T.year} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <FormLabel>{T.month}</FormLabel>
        <Select onValueChange={setMonth} value={month || ""}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={T.month} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {getMonths(year).map((m, index) => (
              <SelectItem key={m} value={(index + 1).toString().padStart(2, "0")}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <FormLabel>{T.day}</FormLabel>
        <Select onValueChange={setDay} value={day || ""}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={T.day} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {getDays(year, month).map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}