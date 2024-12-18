"use client"

import { useState, useEffect } from "react"
import { subYears, isAfter, startOfDay } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormLabel,
} from "@/components/ui/form"

const TODAY = startOfDay(new Date())
const MIN_BIRTH_DATE = subYears(TODAY, 18)
const CURRENT_YEAR = TODAY.getFullYear()

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

interface CalendarBirthProps {
  onChange: (date: string) => void;
  initialValue?: string;
}

export function CalendarBirth({ onChange, initialValue }: CalendarBirthProps) {
  const [year, setYear] = useState<string>("")
  const [month, setMonth] = useState<string>("")
  const [day, setDay] = useState<string>("")

  useEffect(() => {
    if (initialValue) {
      const [y, m, d] = initialValue.split('-')
      setYear(y)
      setMonth(m)
      setDay(d)
    }
  }, [initialValue])

  useEffect(() => {
    if (year && month && day) {
      onChange(`${year}-${month}-${day}`)
    }
  }, [year, month, day, onChange])

  const years = Array.from(
    { length: CURRENT_YEAR - 1900 + 1 },
    (_, i) => (CURRENT_YEAR - i).toString()
  ).filter(y => !isAfter(new Date(parseInt(y), 11, 31), MIN_BIRTH_DATE))

  const getMonths = (selectedYear: string) => {
    if (parseInt(selectedYear) === MIN_BIRTH_DATE.getFullYear()) {
      return MONTHS.slice(0, MIN_BIRTH_DATE.getMonth() + 1)
    }
    return MONTHS
  }

  const getDays = (selectedYear: string, selectedMonth: string) => {
    if (!selectedYear || !selectedMonth) return []
    const monthIndex = parseInt(selectedMonth) - 1
    const daysInMonth = new Date(parseInt(selectedYear), monthIndex + 1, 0).getDate()
    const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'))
    if (parseInt(selectedYear) === MIN_BIRTH_DATE.getFullYear() && monthIndex === MIN_BIRTH_DATE.getMonth()) {
      return days.slice(0, MIN_BIRTH_DATE.getDate())
    }
    return days
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <FormLabel>Año</FormLabel>
        <Select onValueChange={setYear} value={year}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Año" />
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
        <FormLabel>Mes</FormLabel>
        <Select onValueChange={setMonth} value={month}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {getMonths(year).map((m, index) => (
              <SelectItem key={m} value={(index + 1).toString().padStart(2, '0')}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <FormLabel>Día</FormLabel>
        <Select onValueChange={setDay} value={day}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Día" />
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

