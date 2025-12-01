"use client"

import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogIn, LogOut } from "lucide-react"

// --- Translation Interfaces and Data ---

interface TimeOption {
    value: string;
    label: string;
}

interface TimeTranslation {
    checkinTitle: string;
    checkoutTitle: string;
    placeholder: string;
    checkinOptions: TimeOption[];
    checkoutOptions: TimeOption[];
}

const translations: Record<string, TimeTranslation> = {
    es: {
        checkinTitle: "Horario de Check-in",
        checkoutTitle: "Horario de Check-out",
        placeholder: "Seleccionar horario",
        checkinOptions: [
            { value: "12:00", label: "12:00 PM (Mediodía)" },
            { value: "13:00", label: "1:00 PM" },
            { value: "14:00", label: "2:00 PM" },
            { value: "15:00", label: "3:00 PM (Estándar)" },
            { value: "16:00", label: "4:00 PM" },
            { value: "17:00", label: "5:00 PM" },
            { value: "18:00", label: "6:00 PM" },
        ],
        checkoutOptions: [
            { value: "09:00", label: "9:00 AM" },
            { value: "10:00", label: "10:00 AM" },
            { value: "11:00", label: "11:00 AM (Estándar)" },
            { value: "12:00", label: "12:00 PM (Mediodía)" },
            { value: "13:00", label: "1:00 PM" },
            { value: "14:00", label: "2:00 PM" },
        ],
    },
    en: {
        checkinTitle: "Check-in Time",
        checkoutTitle: "Check-out Time",
        placeholder: "Select time",
        checkinOptions: [
            { value: "12:00", label: "12:00 PM (Noon)" },
            { value: "13:00", label: "1:00 PM" },
            { value: "14:00", label: "2:00 PM" },
            { value: "15:00", label: "3:00 PM (Standard)" },
            { value: "16:00", label: "4:00 PM" },
            { value: "17:00", label: "5:00 PM" },
            { value: "18:00", label: "6:00 PM" },
        ],
        checkoutOptions: [
            { value: "09:00", label: "9:00 AM" },
            { value: "10:00", label: "10:00 AM" },
            { value: "11:00", label: "11:00 AM (Standard)" },
            { value: "12:00", label: "12:00 PM (Noon)" },
            { value: "13:00", label: "1:00 PM" },
            { value: "14:00", label: "2:00 PM" },
        ],
    },
}

// --- Component Props Update ---

interface CheckinCheckoutSectionProps {
  checkinTime: string
  setCheckinTime: (value: string) => void
  checkoutTime: string
  setCheckoutTime: (value: string) => void
  defaultCheckinTime?: string
  defaultCheckoutTime?: string
  // Added 'lang' prop
  lang: string
}

export function CheckinCheckoutSection({
  checkinTime,
  setCheckinTime,
  checkoutTime,
  setCheckoutTime,
  defaultCheckinTime = "15:00",
  defaultCheckoutTime = "11:00",
  lang,
}: CheckinCheckoutSectionProps) {
  
  // Select the current translation based on the lang prop
  const currentLangKey = lang.toLowerCase().startsWith("es") ? "es" : "en";
  const t = translations[currentLangKey];
  
  // 🔹 Al montar, si vienen vacíos, inicializamos con los defaults
  useEffect(() => {
    if (!checkinTime || checkinTime === "") {
      setCheckinTime(defaultCheckinTime)
    }
    if (!checkoutTime || checkoutTime === "") {
      setCheckoutTime(defaultCheckoutTime)
    }
  }, [checkinTime, checkoutTime, setCheckinTime, setCheckoutTime, defaultCheckinTime, defaultCheckoutTime])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Horario de Check-in */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <LogIn className="h-4 w-4 text-green-600" />
          {t.checkinTitle}
        </Label>
        <Select value={checkinTime} onValueChange={setCheckinTime}>
          <SelectTrigger>
            <SelectValue placeholder={t.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {t.checkinOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                    {option.label}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Horario de Check-out */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <LogOut className="h-4 w-4 text-red-600" />
          {t.checkoutTitle}
        </Label>
        <Select value={checkoutTime} onValueChange={setCheckoutTime}>
          <SelectTrigger>
            <SelectValue placeholder={t.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {t.checkoutOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                    {option.label}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}