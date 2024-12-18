"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const services = [
  { id: "all", label: "Todo incluido" },
  { id: "nurse", label: "Nurse" },
  { id: "coordinator", label: "Coordinator" },
  { id: "food", label: "Food" },
  { id: "transportation", label: "Transportation" },
  { id: "none", label: "None" },
] as const

const formSchema = z.object({
  numberOfRooms: z.string().refine((val) => {
    const num = parseInt(val)
    return num >= 1 && num <= 20
  }, {
    message: "El número de habitaciones debe estar entre 1 y 20",
  }),
  services: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Debes seleccionar al menos un servicio",
  }),
})

export type AmenitiesFormValues = z.infer<typeof formSchema>

interface AmenitiesFormProps {
  onSubmit: (values: AmenitiesFormValues) => void
  onBack: () => void
  initialValues?: Partial<AmenitiesFormValues>
}

export function AmenitiesForm({ onSubmit, onBack, initialValues }: AmenitiesFormProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(initialValues?.services || [])

  const form = useForm<AmenitiesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfRooms: initialValues?.numberOfRooms || "1",
      services: initialValues?.services || [],
    },
  })

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    let newServices: string[]

    if (serviceId === "all") {
      if (checked) {
        // If "Todo incluido" is selected, select all except "None"
        newServices = services.filter(s => s.id !== "none").map(s => s.id)
      } else {
        newServices = []
      }
    } else if (serviceId === "none") {
      if (checked) {
        // If "None" is selected, deselect all others
        newServices = ["none"]
      } else {
        newServices = selectedServices.filter(id => id !== "none")
      }
    } else {
      if (checked) {
        // Remove "None" if it was selected
        newServices = selectedServices.filter(id => id !== "none")
        newServices.push(serviceId)
      } else {
        newServices = selectedServices.filter(id => id !== serviceId)
      }
    }

    setSelectedServices(newServices)
    form.setValue("services", newServices)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="numberOfRooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de habitaciones</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el número de habitaciones" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Este número determinará cuántas habitaciones podrás configurar en el siguiente paso.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="services"
            render={() => (
              <FormItem>
                <FormLabel>Servicios</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <FormItem
                      key={service.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => {
                            handleServiceChange(service.id, checked as boolean)
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {service.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  )
}

