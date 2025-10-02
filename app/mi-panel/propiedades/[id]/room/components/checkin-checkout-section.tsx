"use client"

import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogIn, LogOut } from "lucide-react"

interface CheckinCheckoutSectionProps {
  checkinTime: string
  setCheckinTime: (value: string) => void
  checkoutTime: string
  setCheckoutTime: (value: string) => void
  defaultCheckinTime?: string
  defaultCheckoutTime?: string
}

export function CheckinCheckoutSection({
  checkinTime,
  setCheckinTime,
  checkoutTime,
  setCheckoutTime,
  defaultCheckinTime = "15:00",
  defaultCheckoutTime = "11:00",
}: CheckinCheckoutSectionProps) {
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
          Horario de Check-in
        </Label>
        <Select value={checkinTime} onValueChange={setCheckinTime}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar horario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12:00">12:00 PM (Mediodía)</SelectItem>
            <SelectItem value="13:00">1:00 PM</SelectItem>
            <SelectItem value="14:00">2:00 PM</SelectItem>
            <SelectItem value="15:00">3:00 PM (Estándar)</SelectItem>
            <SelectItem value="16:00">4:00 PM</SelectItem>
            <SelectItem value="17:00">5:00 PM</SelectItem>
            <SelectItem value="18:00">6:00 PM</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Horario de Check-out */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <LogOut className="h-4 w-4 text-red-600" />
          Horario de Check-out
        </Label>
        <Select value={checkoutTime} onValueChange={setCheckoutTime}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar horario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="09:00">9:00 AM</SelectItem>
            <SelectItem value="10:00">10:00 AM</SelectItem>
            <SelectItem value="11:00">11:00 AM (Estándar)</SelectItem>
            <SelectItem value="12:00">12:00 PM (Mediodía)</SelectItem>
            <SelectItem value="13:00">1:00 PM</SelectItem>
            <SelectItem value="14:00">2:00 PM</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
