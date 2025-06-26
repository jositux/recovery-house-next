"use client";

import { Bed, BedDouble, Home, Users } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import type { z } from "zod";

// Importa el esquema de validación del formulario padre
import type { formSchema } from "./RoomForm"; // Asegúrate de que la ruta de importación sea correcta

// Define el tipo FormData basado en el esquema zod
type FormData = z.infer<typeof formSchema>;

interface RoomTypeSelectorProps {
  control: Control<FormData>;
  isPrivate: boolean;
  singleBeds: number;
  doubleBeds: number;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

// Function to pluralize words in Spanish
export const pluralize = (
  quantity: number,
  singular: string,
  plural: string
) => {
  return quantity === 1 ? `${quantity} ${singular}` : `${quantity} ${plural}`;
};

export default function RoomTypeSelector({
  control,
  isPrivate,
  singleBeds,
  doubleBeds,
  watch,
  setValue,
}: RoomTypeSelectorProps) {
  // Update total beds when single or double beds change
  useEffect(() => {
    const totalBeds = singleBeds + doubleBeds;
    setValue("beds", totalBeds);

    // Also update capacity based on beds
    // Assuming 1 person per single bed and 2 per double bed
    const estimatedCapacity = singleBeds + doubleBeds * 2;
    setValue("capacity", estimatedCapacity);
  }, [singleBeds, doubleBeds, setValue]);

  // Verificar si no hay camas seleccionadas (para habitación privada)
  const noBeds = singleBeds === 0 && doubleBeds === 0;

  // Obtener el tipo de cama seleccionado (para habitación compartida)
  const bedType = watch("bedType");
  const noBedTypeSelected = !bedType || bedType === "";

  // Obtener los valores actuales de los precios para mostrar en DEBUG
  const privatePrice = watch("privateRoomPrice");
  const privateCleaning = watch("privateRoomCleaning");
  const sharedPrice = watch("sharedRoomPrice");
  const sharedCleaning = watch("sharedRoomCleaning");

  return (
    <div className="p-4 bg-white rounded-xl">
      <FormField
        control={control}
        name="isPrivate"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Tipo de Alojamiento</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value ? "true" : "false"}
                className="grid grid-cols-2 gap-4"
              >
                <label
                  htmlFor="private"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    field.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <RadioGroupItem
                    value="true"
                    id="private"
                    className="sr-only"
                  />
                  <Home className="h-8 w-8 mb-2" />
                  <span className="font-medium">Habitación Privada</span>
                  <span className="text-xs text-muted-foreground">
                    Uso exclusivo, se reserva toda la habitación
                  </span>
                </label>
                <label
                  htmlFor="shared"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    !field.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <RadioGroupItem
                    value="false"
                    id="shared"
                    className="sr-only"
                  />
                  <Users className="h-8 w-8 mb-2" />
                  <span className="font-medium">Cama</span>
                  <span className="text-xs text-muted-foreground">
                    Se carga solamente 1 cama
                  </span>
                </label>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* DEBUG INFO - Mostrar valores actuales */}
      <div className="mt-4 hidden p-3 bg-gray-100 rounded-lg text-xs">
        <strong>DEBUG - Valores en tiempo real:</strong>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <strong>PRIVADA:</strong> Precio: {privatePrice || "vacío"} |
            Limpieza: {privateCleaning || "vacío"}
          </div>
          <div>
            <strong>COMPARTIDA:</strong> Precio: {sharedPrice || "vacío"} |
            Limpieza: {sharedCleaning || "vacío"}
          </div>
        </div>
        <div className="mt-1">
          <strong>Tipo actual:</strong> {isPrivate ? "Privada" : "Compartida"}
        </div>
      </div>

      {/* Beds Configuration */}
      {isPrivate ? (
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
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
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
                            {pluralize(
                              i,
                              "cama individual",
                              "camas individuales"
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
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
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pt-6 bg-white rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="bedType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cama</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Cama Simple</SelectItem>
                      <SelectItem value="double">Cama Doble</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="bedName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Cama</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Cama 1, Litera Superior..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Capacity and Total Beds (calculated fields) */}
      {isPrivate && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pt-4 bg-white rounded-xl">
          <FormField
            control={control}
            name="beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total de Camas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormDescription>Según camas elegidas</FormDescription>
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
                <FormDescription>
                  Sugerido, pero puede ajustarse
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      )}

      {/* CAMPOS DE PRECIO COMPLETAMENTE INDEPENDIENTES CON NOMBRES ÚNICOS */}
      <div className="pt-4">
        {isPrivate ? (
          // SOLO campos para habitación PRIVADA - NOMBRES ÚNICOS
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Precios para Habitación Privada
            </h3>
            {noBeds && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <p className="text-sm font-medium">
                  Debe seleccionar al menos 1 cama para configurar los precios.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50">
              <FormField
                control={control}
                name="privateRoomPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por Noche (Privada)</FormLabel>
                    <FormControl>
                      <Input
                        key={`private-price-${isPrivate}`} // Key único para forzar re-render
                        id="privateRoomPrice"
                        type="number"
                        step="1"
                        min="1"
                        disabled={noBeds}
                        value={isPrivate ? privatePrice || "" : ""} // Solo mostrar valor si es el tipo correcto
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange("");
                          } else {
                            const numValue = Number(value);
                            if (numValue >= 0) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        placeholder={
                          noBeds
                            ? "Seleccione camas primero"
                            : "Precio habitación completa"
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Para toda la habitación privada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="privateRoomCleaning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa de Limpieza (Privada)</FormLabel>
                    <FormControl>
                      <Input
                        key={`private-cleaning-${isPrivate}`} // Key único para forzar re-render
                        id="privateRoomCleaning"
                        type="number"
                        step="1"
                        min="0"
                        disabled={noBeds}
                        value={isPrivate ? privateCleaning || "" : ""} // Solo mostrar valor si es el tipo correcto
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange("");
                          } else {
                            const numValue = Number(value);
                            if (numValue >= 0) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        placeholder={
                          noBeds
                            ? "Seleccione camas primero"
                            : "Limpieza habitación"
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Opcional para habitación privada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ) : (
          // SOLO campos para habitación COMPARTIDA - NOMBRES ÚNICOS
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Precios para la Cama
            </h3>
            {noBedTypeSelected && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <p className="text-sm font-medium">
                  Debe seleccionar el tipo de cama para configurar los precios.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <FormField
                control={control}
                name="sharedRoomPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por Cama</FormLabel>
                    <FormControl>
                      <Input
                        key={`shared-price-${isPrivate}`} // Key único para forzar re-render
                        id="sharedRoomPrice"
                        type="number"
                        step="1"
                        min="1"
                        disabled={noBedTypeSelected}
                        value={!isPrivate ? sharedPrice || "" : ""} // Solo mostrar valor si es el tipo correcto
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange("");
                          } else {
                            const numValue = Number(value);
                            if (numValue >= 0) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        placeholder={
                          noBedTypeSelected
                            ? "Seleccione tipo de cama primero"
                            : "Precio por cama individual"
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {bedType === "single" &&
                        "Por 1 cama"}
                      {bedType === "double" &&
                        "Por 1 cama"}
                      {!bedType && "Por cada cama en habitación compartida"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="sharedRoomCleaning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limpieza por Cama</FormLabel>
                    <FormControl>
                      <Input
                        key={`shared-cleaning-${isPrivate}`} // Key único para forzar re-render
                        id="sharedRoomCleaning"
                        type="number"
                        step="1"
                        min="0"
                        disabled={noBedTypeSelected}
                        value={!isPrivate ? sharedCleaning || "" : ""} // Solo mostrar valor si es el tipo correcto
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange("");
                          } else {
                            const numValue = Number(value);
                            if (numValue >= 0) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        placeholder={
                          noBedTypeSelected
                            ? "Seleccione tipo de cama primero"
                            : "Limpieza por cama"
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {bedType === "single" &&
                        "Opcional"}
                      {bedType === "double" && "Opcional"}
                      {!bedType && "Opcional para habitación compartida"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
