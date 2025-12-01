"use client";

import { Bed, BedDouble, Home } from "lucide-react";
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
//import type { z } from "zod";

// Importa el esquema de validación del formulario padre
import type { RoomFormData } from "../RoomForm"; // Asegúrate de que la ruta de importación sea correcta

// Define el tipo FormData basado en el esquema zod
type FormData = RoomFormData;

// ===============================================================
// 📚 Objeto de Traducciones
// ===============================================================

type TranslationText = {
  roomTypeLabel: string;
  privateRoom: string;
  privateRoomDesc: string;
  sharedBed: string;
  sharedBedDesc: string;
  debugTitle: string;
  debugPrivate: string;
  debugShared: string;
  debugCurrentType: string;
  debugEmpty: string;

  // Private Room
  singleBedsTitle: string;
  doubleBedsTitle: string;
  quantityLabel: string;
  selectQuantityPlaceholder: string;
  singleBedSingular: string;
  singleBedPlural: string;
  doubleBedSingular: string;
  doubleBedPlural: string;
  
  // Shared Room
  bedTypeLabel: string;
  selectTypePlaceholder: string;
  bedNameLabel: string;
  bedNamePlaceholder: string;
  simpleBedType: string;
  doubleBedType: string;

  // Calculated Fields (Hidden)
  totalBedsLabel: string;
  totalBedsDesc: string;
  maxCapacityLabel: string;
  maxCapacityDesc: string;

  // Prices (Private)
  privatePriceTitle: string;
  privatePriceWarning: string;
  privatePriceLabel: string;
  privatePriceDesc: string;
  privateCleaningLabel: string;
  privateCleaningDesc: string;
  selectBedsPlaceholder: string;

  // Prices (Shared)
  sharedPriceTitle: string;
  sharedPriceWarning: string;
  sharedPriceLabel: string;
  sharedPriceDescSingle: string;
  sharedPriceDescDouble: string;
  sharedPriceDescDefault: string;
  sharedCleaningLabel: string;
  sharedCleaningDescOptional: string;
  sharedCleaningDescDefault: string;
  selectBedTypePlaceholder: string;
  pricePerSingleBedPlaceholder: string;
};

const translations: Record<string, TranslationText> = {
  es: {
    roomTypeLabel: "Tipo de Alojamiento",
    privateRoom: "Habitación Privada",
    privateRoomDesc: "Uso exclusivo, se reserva toda la habitación",
    sharedBed: "Cama (Habitación compartida)",
    sharedBedDesc: "Se toma 1 cama como unidad de alojamiento",
    debugTitle: "DEBUG - Valores en tiempo real:",
    debugPrivate: "PRIVADA:",
    debugShared: "COMPARTIDA:",
    debugCurrentType: "Tipo actual:",
    debugEmpty: "vacío",

    // Private Room
    singleBedsTitle: "Camas Individuales",
    doubleBedsTitle: "Camas Dobles",
    quantityLabel: "Cantidad",
    selectQuantityPlaceholder: "Seleccionar cantidad",
    singleBedSingular: "cama individual",
    singleBedPlural: "camas individuales",
    doubleBedSingular: "cama doble",
    doubleBedPlural: "camas dobles",
    
    // Shared Room
    bedTypeLabel: "Tipo de Cama",
    selectTypePlaceholder: "Seleccionar tipo",
    bedNameLabel: "Nombre de la Cama",
    bedNamePlaceholder: "Ej: Cama 1, Litera Superior...",
    simpleBedType: "Cama Sencilla",
    doubleBedType: "Cama Doble",

    // Calculated Fields (Hidden)
    totalBedsLabel: "Total de Camas",
    totalBedsDesc: "Según camas elegidas",
    maxCapacityLabel: "Capacidad Máxima de personas",
    maxCapacityDesc: "Sugerido, pero puede ajustarse",

    // Prices (Private)
    privatePriceTitle: "Precios para la Habitación (U$D)",
    privatePriceWarning: "Debe seleccionar al menos 1 cama para configurar los precios.",
    privatePriceLabel: "Precio x Noche",
    privatePriceDesc: "Para toda la habitación privada",
    privateCleaningLabel: "Tarifa de Limpieza",
    privateCleaningDesc: "Opcional para habitación privada",
    selectBedsPlaceholder: "Seleccione camas primero",

    // Prices (Shared)
    sharedPriceTitle: "Precios para la Cama (U$D)",
    sharedPriceWarning: "Debe seleccionar el tipo de cama para configurar los precios.",
    sharedPriceLabel: "Precio x Noche",
    sharedPriceDescSingle: "Por 1 cama",
    sharedPriceDescDouble: "Por 1 cama",
    sharedPriceDescDefault: "Por cada cama en habitación compartida",
    sharedCleaningLabel: "Tarifa de Limpieza",
    sharedCleaningDescOptional: "Opcional",
    sharedCleaningDescDefault: "Opcional para habitación compartida",
    selectBedTypePlaceholder: "Seleccione tipo de cama primero",
    pricePerSingleBedPlaceholder: "Precio por cama individual",
  },
  en: {
    roomTypeLabel: "Accommodation Type",
    privateRoom: "Private Room",
    privateRoomDesc: "Exclusive use, the entire room is booked",
    sharedBed: "Bed (Shared Room)",
    sharedBedDesc: "1 bed is taken as the unit of accommodation",
    debugTitle: "DEBUG - Real-time Values:",
    debugPrivate: "PRIVATE:",
    debugShared: "SHARED:",
    debugCurrentType: "Current Type:",
    debugEmpty: "empty",

    // Private Room
    singleBedsTitle: "Single Beds",
    doubleBedsTitle: "Double Beds",
    quantityLabel: "Quantity",
    selectQuantityPlaceholder: "Select quantity",
    singleBedSingular: "single bed",
    singleBedPlural: "single beds",
    doubleBedSingular: "double bed",
    doubleBedPlural: "double beds",
    
    // Shared Room
    bedTypeLabel: "Bed Type",
    selectTypePlaceholder: "Select type",
    bedNameLabel: "Bed Name",
    bedNamePlaceholder: "Ex: Bed 1, Upper Bunk...",
    simpleBedType: "Simple Bed",
    doubleBedType: "Double Bed",

    // Calculated Fields (Hidden)
    totalBedsLabel: "Total Beds",
    totalBedsDesc: "Based on chosen beds",
    maxCapacityLabel: "Maximum Guest Capacity",
    maxCapacityDesc: "Suggested, but can be adjusted",

    // Prices (Private)
    privatePriceTitle: "Room Prices (U$D)",
    privatePriceWarning: "You must select at least 1 bed to set prices.",
    privatePriceLabel: "Price per Night",
    privatePriceDesc: "For the entire private room",
    privateCleaningLabel: "Cleaning Fee",
    privateCleaningDesc: "Optional for private room",
    selectBedsPlaceholder: "Select beds first",

    // Prices (Shared)
    sharedPriceTitle: "Bed Prices (U$D)",
    sharedPriceWarning: "You must select the bed type to set prices.",
    sharedPriceLabel: "Price per Night",
    sharedPriceDescSingle: "For 1 bed",
    sharedPriceDescDouble: "For 1 bed",
    sharedPriceDescDefault: "Per bed in shared room",
    sharedCleaningLabel: "Cleaning Fee",
    sharedCleaningDescOptional: "Optional",
    sharedCleaningDescDefault: "Optional for shared room",
    selectBedTypePlaceholder: "Select bed type first",
    pricePerSingleBedPlaceholder: "Price per single bed",
  },
};

interface RoomTypeSelectorProps {
  control: Control<FormData>;
  isPrivate: boolean;
  singleBeds: number;
  doubleBeds: number;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  lang: string; // ✅ Añadida la prop lang
}

// Function to pluralize words, now supports ES and EN
export const pluralize = (
  quantity: number,
  singular: string,
  plural: string,
  lang: string
) => {
  if (lang === 'en') {
      const singularEn = singular.replace(/(cama\s+individual|cama\s+doble)/g, (match) => {
          if (match === 'cama individual') return 'single bed';
          if (match === 'cama doble') return 'double bed';
          return match;
      });
      const pluralEn = plural.replace(/(camas\s+individuales|camas\s+dobles)/g, (match) => {
          if (match === 'camas individuales') return 'single beds';
          if (match === 'camas dobles') return 'double beds';
          return match;
      });
      return quantity === 1 ? `${quantity} ${singularEn}` : `${quantity} ${pluralEn}`;
  }
  
  // Spanish (default)
  return quantity === 1 ? `${quantity} ${singular}` : `${quantity} ${plural}`;
};

export default function RoomTypeSelector({
  control,
  isPrivate,
  singleBeds,
  doubleBeds,
  watch,
  setValue,
  lang, // ✅ Recibiendo lang
}: RoomTypeSelectorProps) {
  
  // 🌐 Lógica de Idioma
  const currentLang = lang === 'es' ? 'es' : 'en';
  const texts = translations[currentLang];
  
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
            <FormLabel>{texts.roomTypeLabel}</FormLabel>
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
                  <span className="font-medium text-center">{texts.privateRoom}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {texts.privateRoomDesc}
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
                  <Bed className="h-8 w-8 mb-2" />
                  <span className="font-medium text-center">{texts.sharedBed}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {texts.sharedBedDesc}
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
        <strong>{texts.debugTitle}</strong>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <strong>{texts.debugPrivate}</strong> Precio: {privatePrice || texts.debugEmpty} |
            Limpieza: {privateCleaning || texts.debugEmpty}
          </div>
          <div>
            <strong>{texts.debugShared}</strong> Precio: {sharedPrice || texts.debugEmpty} |
            Limpieza: {sharedCleaning || texts.debugEmpty}
          </div>
        </div>
        <div className="mt-1">
          <strong>{texts.debugCurrentType}</strong> {isPrivate ? texts.privateRoom : texts.sharedBed}
        </div>
      </div>

      {/* Beds Configuration */}
      {isPrivate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 bg-white rounded-xl">
          {/* Single beds section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bed className="h-5 w-5" />
              <h3 className="text-lg font-medium">{texts.singleBedsTitle}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={control}
                name="singleBeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.quantityLabel}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={texts.selectQuantityPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(11)].map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {pluralize(
                              i,
                              texts.singleBedSingular,
                              texts.singleBedPlural,
                              currentLang
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
              <h3 className="text-lg font-medium">{texts.doubleBedsTitle}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={control}
                name="doubleBeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.quantityLabel}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={texts.selectQuantityPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(11)].map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {pluralize(
                              i,
                              texts.doubleBedSingular,
                              texts.doubleBedPlural,
                              currentLang
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
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pt-6 bg-white rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="bedType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{texts.bedTypeLabel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={texts.selectTypePlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">{texts.simpleBedType}</SelectItem>
                      <SelectItem value="double">{texts.doubleBedType}</SelectItem>
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
                  <FormLabel>{texts.bedNameLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={texts.bedNamePlaceholder}
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
        <div className="grid hidden grid-cols-2 md:grid-cols-2 gap-4 pt-4 bg-white rounded-xl">
          <FormField
            control={control}
            name="beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.totalBedsLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormDescription>{texts.totalBedsDesc}</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.maxCapacityLabel}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  {texts.maxCapacityDesc}
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
              {texts.privatePriceTitle}
            </h3>
            {noBeds && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <p className="text-sm font-medium">
                  {texts.privatePriceWarning}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <FormField
                control={control}
                name="privateRoomPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.privatePriceLabel}</FormLabel>
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
                            ? texts.selectBedsPlaceholder
                            : ""
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {texts.privatePriceDesc}
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
                    <FormLabel>{texts.privateCleaningLabel}</FormLabel>
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
                            ? texts.selectBedsPlaceholder
                            : ""
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {texts.privateCleaningDesc}
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
              {texts.sharedPriceTitle}
            </h3>
            {noBedTypeSelected && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <p className="text-sm font-medium">
                  {texts.sharedPriceWarning}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <FormField
                control={control}
                name="sharedRoomPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.sharedPriceLabel}</FormLabel>
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
                            ? texts.selectBedTypePlaceholder
                            : texts.pricePerSingleBedPlaceholder
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {bedType === "single" && texts.sharedPriceDescSingle}
                      {bedType === "double" && texts.sharedPriceDescDouble}
                      {!bedType && texts.sharedPriceDescDefault}
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
                    <FormLabel>{texts.sharedCleaningLabel}</FormLabel>
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
                            ? texts.selectBedTypePlaceholder
                            : ""
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {(bedType === "single" || bedType === "double") && texts.sharedCleaningDescOptional}
                      {!bedType && texts.sharedCleaningDescDefault}
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