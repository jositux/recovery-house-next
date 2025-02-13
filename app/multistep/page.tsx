"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import PropertyForm from "./propertyForm"
import RoomAccordion from "@/components/RoomAccordion"
import { propertyService, type PropertyData } from "@/services/propertyService"
import { roomService, type RoomData } from "@/services/RoomService"
import type { FormValues } from "./propertyForm"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface Room {
  id: string
  name: string
  roomNumber: string
  description: string
  beds: number
  capacity: number
  pricePerNight: string
  cleaningFee: string
  mainImage: string
  photos: string[]
  extraTags: string[]
  servicesTags: string[]
  propertyId: string
}

const initialPropertyValues: Partial<FormValues> = {
  name: "",
  description: "",
  country: "",
  state: "",
  city: "",
  postalCode: "",
  address: "",
  fullAddress: "",
  latitude: 0,
  longitude: 0,
  type: "Stay",
  taxIdEIN: "",
  mainImage: "",
  RNTFile: "",
  taxIdEINFile: "",
  hostName: "",
  guestComments: "",
}

export default function RegisterPropertyBasePage() {
  const [step, setStep] = useState(1)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [propertyValues, setPropertyValues] = useState<Partial<FormValues>>(initialPropertyValues)
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "Habitación 1",
      roomNumber: "",
      description: "",
      beds: 1,
      capacity: 1,
      pricePerNight: "",
      cleaningFee: "",
      mainImage: "",
      photos: [],
      extraTags: [],
      servicesTags: [],
      propertyId: "0",
    },
  ])

  const router = useRouter()

  const handlePropertySubmit = useCallback(async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const response = await propertyService.createProperty(values as PropertyData)
      setPropertyId(response.data.id)
      setPropertyValues(values)
      console.log(values)
      setStep(2)
    } catch (error) {
      console.error("Error al registrar la propiedad:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleRoomSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await Promise.all(
        rooms.map(async (room) => {
          const roomData: RoomData = {
            ...room,
            mainImage: propertyValues.mainImage || "",
            propertyId: propertyId || "",
          }
          await roomService.createRoom(roomData)
        }),
      )
      router.push("/mis-propiedades")
    } catch (error) {
      console.error("Error al registrar las habitaciones:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [rooms, propertyId, router])

  /*const handleBack = useCallback(() => {
    setStep(1)
  }, [])*/

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Registra tu propiedad</h1>
      {step === 1 ? (
        <PropertyForm onSubmit={handlePropertySubmit} isSubmitting={isSubmitting} initialValues={propertyValues} />
      ) : (
        <div className="space-y-8">
        <div className="container mx-auto py-12">
          <h1 className="text-2xl font-bold mb-8">Datos de las habitaciones</h1>
          <RoomAccordion rooms={rooms} setRooms={setRooms} />
        </div>

        <div className="flex justify-between">
         
          <Button
            onClick={handleRoomSubmit}
            className="bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Save className="animate-spin" />
                GUARDANDO...
              </>
            ) : (
              <>
                <Save />
                REGISTRAR HABITACIONES
              </>
            )}
          </Button>
        </div>
      </div>
      )}
    </div>
  )
}

