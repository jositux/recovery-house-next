"use client"

import { Bed, BedDouble, Home, Users } from "lucide-react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form"
import type { z } from "zod"

// Importa el esquema de validación del formulario padre
import type { formSchema } from "./RoomForm" // Asegúrate de que la ruta de importación sea correcta

// Define el tipo FormData basado en el esquema zod
type FormData = z.infer<typeof formSchema>

interface RoomTypeSelectorProps {
  control: Control<FormData>
  isPrivate: boolean
  singleBeds: number
  doubleBeds: number
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
}

// Function to pluralize words in Spanish
export const pluralize = (quantity: number, singular: string, plural: string) => {
  return quantity === 1 ? `${quantity} ${singular}` : `${quantity} ${plural}`
}

export default function RoomTypeSelector({
  control,
  isPrivate,
  singleBeds,
  doubleBeds,
  //watch,
  setValue,
}: RoomTypeSelectorProps) {
  // Update total beds when single or double beds change
  useEffect(() => {
    const totalBeds = singleBeds + doubleBeds
    setValue("beds", totalBeds)

    // Also update capacity based on beds
    // Assuming 1 person per single bed and 2 per double bed
    const estimatedCapacity = singleBeds + doubleBeds * 2
    setValue("capacity", estimatedCapacity)
  }, [singleBeds, doubleBeds, setValue])

  // Efecto para resetear los precios cuando cambia la cantidad de camas
  useEffect(() => {
    // Si se selecciona 0 camas individuales, resetear sus precios
    if (singleBeds === 0 && !isPrivate) {
      setValue("singleBedPrice", 0)
      setValue("singleBedCleaningPrice", 0)
    }

    // Si se selecciona 0 camas dobles, resetear sus precios
    if (doubleBeds === 0 && !isPrivate) {
      setValue("doubleBedPrice", 0)
      setValue("doubleBedCleaningPrice", 0)
    }

    // Si no hay camas en habitación privada, resetear los precios
    if (singleBeds === 0 && doubleBeds === 0 && isPrivate) {
      setValue("pricePerNight", 0)
      setValue("cleaningFee", 0)
    }
  }, [singleBeds, doubleBeds, isPrivate, setValue])

  // Verificar si no hay camas seleccionadas
  const noBeds = singleBeds === 0 && doubleBeds === 0

  return (
    <div className="p-4 bg-white rounded-xl">
      <FormField
        control={control}
        name="isPrivate"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Tipo de Habitación</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value ? "true" : "false"}
                className="grid grid-cols-2 gap-4"
              >
                <label
                  htmlFor="private"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    field.value ? "border-primary bg-primary/10" : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <RadioGroupItem value="true" id="private" className="sr-only" />
                  <Home className="h-8 w-8 mb-2" />
                  <span className="font-medium">Privada</span>
                  <span className="text-xs text-muted-foreground">Uso exclusivo, se reserva toda la habitación</span>
                </label>
                <label
                  htmlFor="shared"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    !field.value ? "border-primary bg-primary/10" : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <RadioGroupItem value="false" id="shared" className="sr-only" />
                  <Users className="h-8 w-8 mb-2" />
                  <span className="font-medium">Compartida</span>
                  <span className="text-xs text-muted-foreground">Múltiples huéspedes, se reserva por cama</span>
                </label>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

{/* Mensaje de advertencia cuando no hay camas */}
{noBeds && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <p className="text-sm font-medium">Debe seleccionar al menos 1 cama para configurar los precios.</p>
        </div>
      )}
      {/* Beds Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 bg-white rounded-xl">
        {/* Single beds section */}
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bed className="h-5 w-5" />
            <h3 className="text-lg font-medium">Camas Individuales</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={control}
              name="singleBeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number.parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cantidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(11)].map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {pluralize(i, "cama individual", "camas individuales")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isPrivate && (
              <>
                <FormField
                  control={control}
                  name="singleBedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio por noche (por cama)</FormLabel>
                      <FormControl>
                        <Input
                          id="singleBedPrice"
                          type="number"
                          min="0"
                          disabled={singleBeds === 0}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            // Si el valor está vacío, establecer a 0 o a un string vacío según se necesite
                            if (value === "") {
                              field.onChange(0)
                            } else {
                              // Convertir a número y manejar NaN
                              const numValue = Number(value)
                              field.onChange(isNaN(numValue) ? 0 : numValue)
                            }
                          }}
                          onFocus={() => {
                            if (field.value === 0) {
                              field.onChange("")
                            }
                          }}
                        />
                      </FormControl>
                      {singleBeds > 0 && (
                        <FormDescription className="text-amber-600 font-medium">
                          Requerido para camas individuales
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="singleBedCleaningPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de limpieza (por cama)</FormLabel>
                      <FormControl>
                        <Input
                          id="singleBedCleaningPrice"
                          type="number"
                          min="0"
                          disabled={singleBeds === 0}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            // Si el valor está vacío, establecer a 0 o a un string vacío según se necesite
                            if (value === "") {
                              field.onChange(0)
                            } else {
                              // Convertir a número y manejar NaN
                              const numValue = Number(value)
                              field.onChange(isNaN(numValue) ? 0 : numValue)
                            }
                          }}
                          onFocus={() => {
                            if (field.value === 0) {
                              field.onChange("")
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Puede ser 0</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>

        {/* Double beds section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <BedDouble className="h-5 w-5" />
            <h3 className="text-lg font-medium">Camas Dobles</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={control}
              name="doubleBeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number.parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cantidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(11)].map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {pluralize(i, "cama doble", "camas dobles")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isPrivate && (
              <>
                <FormField
                  control={control}
                  name="doubleBedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio por noche (por cama)</FormLabel>
                      <FormControl>
                        <Input
                          id="doubleBedPrice"
                          type="number"
                          min="0"
                          disabled={doubleBeds === 0}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            // Si el valor está vacío, establecer a 0 o a un string vacío según se necesite
                            if (value === "") {
                              field.onChange(0)
                            } else {
                              // Convertir a número y manejar NaN
                              const numValue = Number(value)
                              field.onChange(isNaN(numValue) ? 0 : numValue)
                            }
                          }}
                          onFocus={() => {
                            if (field.value === 0) {
                              field.onChange("")
                            }
                          }}
                        />
                      </FormControl>
                      {doubleBeds > 0 && (
                        <FormDescription className="text-amber-600 font-medium">
                          Requerido para camas dobles
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="doubleBedCleaningPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de limpieza (por cama)</FormLabel>
                      <FormControl>
                        <Input
                          id="doubleBedCleaningPrice"
                          type="number"
                          min="0"
                          disabled={doubleBeds === 0}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            // Si el valor está vacío, establecer a 0 o a un string vacío según se necesite
                            if (value === "") {
                              field.onChange(0)
                            } else {
                              // Convertir a número y manejar NaN
                              const numValue = Number(value)
                              field.onChange(isNaN(numValue) ? 0 : numValue)
                            }
                          }}
                          onFocus={() => {
                            if (field.value === 0) {
                              field.onChange("")
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Puede ser 0</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>
      </div>

      

      {/* Capacity and Total Beds (calculated fields) */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pt-4 bg-white rounded-xl">
        <FormField
          control={control}
          name="beds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total de Camas</FormLabel>
              <FormControl>
                <Input type="number" {...field} readOnly className="bg-gray-50" />
              </FormControl>
              <FormDescription>Según camas elegidas</FormDescription>
              {/* Eliminamos el FormMessage para que no muestre errores */}
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidad Máxima de personas</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>Sugerido, pero puede ajustarse</FormDescription>
              {/* Eliminamos el FormMessage para que no muestre errores */}
            </FormItem>
          )}
        />
      </div>

      {/* Pricing section for private rooms */}
      {isPrivate && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pt-4 bg-white rounded-xl">
          <FormField
            control={control}
            name="pricePerNight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio por Noche</FormLabel>
                <FormControl>
                  <Input
                    id="pricePerNight"
                    type="number"
                    step="1"
                    disabled={noBeds}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      // Si el valor está vacío, establecer a 0 o a un string vacío según se necesite
                      if (value === "") {
                        field.onChange(0)
                      } else {
                        // Convertir a número y manejar NaN
                        const numValue = Number(value)
                        field.onChange(isNaN(numValue) ? 0 : numValue)
                      }
                    }}
                    onFocus={() => {
                      if (field.value === 0) {
                        field.onChange("")
                      }
                    }}
                  />
                </FormControl>
                {!noBeds && (
                  <FormDescription className="text-amber-600 font-medium">
                    Requerido para habitaciones privadas
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="cleaningFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarifa de Limpieza</FormLabel>
                <FormControl>
                  <Input
                    id="cleaningFee"
                    type="number"
                    step="1"
                    disabled={noBeds}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      // Si el valor está vacío, establecer a 0 o a un string vacío según se necesite
                      if (value === "") {
                        field.onChange(0)
                      } else {
                        // Convertir a número y manejar NaN
                        const numValue = Number(value)
                        field.onChange(isNaN(numValue) ? 0 : numValue)
                      }
                    }}
                    onFocus={() => {
                      if (field.value === 0) {
                        field.onChange("")
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>Puede ser 0</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
