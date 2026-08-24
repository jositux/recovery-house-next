"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
// Importar ambos locales
import { es, enUS } from "date-fns/locale"; 
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Check, X, RotateCcw } from "lucide-react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NumberInput } from "@/components/number-input";
import LocationAutocomplete from "@/components/ui/location-autocomplete2";

// 🛑 Importar el tipo LocationOption para la nueva prop
import type { LocationOption } from "@/services/LocationService"; 

// 🛑 Interfaz de procedimiento actualizada: canónico (ES) y traducción (EN)
interface Procedure {
  name_es: string;
  name_en: string;
  icon: string;
}

// 🛑 Lista maestra de procedimientos actualizada
const ALL_PROCEDURES: Procedure[] = [
  { name_es: "Cirugía plástica", name_en: "Plastic surgery", icon: "/assets/icons/00.svg" },
  { name_es: "Cirugía bariátrica", name_en: "Bariatric surgery", icon: "/assets/icons/01.svg" },
  { name_es: "Implante capilar", name_en: "Hair transplant", icon: "/assets/icons/02.svg" },
  { name_es: "Salud mental", name_en: "Mental health", icon: "/assets/icons/03.svg" },
  { name_es: "Rehabilitación", name_en: "Rehabilitation", icon: "/assets/icons/04.svg" },
  { name_es: "Otro", name_en: "Other", icon: "/assets/icons/05.svg" },
];

// --- Utilidades de Traducción ---

// Obtiene el nombre del procedimiento según el idioma actual
const getProcedureName = (procedure: Procedure, lang: string) => {
    return lang === 'es' ? procedure.name_es : procedure.name_en;
}

// Encuentra el objeto Procedure usando el nombre en cualquier idioma
const findProcedureByAnyName = (name: string): Procedure | undefined => {
    return ALL_PROCEDURES.find(p => p.name_es === name || p.name_en === name);
}

// --- Componente Principal ---

interface MedicalSearchMobileProps {
  onSearch: () => void;
  // 🛑 Ahora recibe el idioma como prop
  lang: string; 
  // ✅ NUEVA PROP para pasar las ubicaciones disponibles
  availableLocations: LocationOption[]; 
}

const MedicalSearchMobile = ({ 
  onSearch, 
  lang = "es", 
  // ✅ Destructurar la nueva prop
  availableLocations = [] 
}: MedicalSearchMobileProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [patientCount, setPatientCount] = useState(1);
  
  const isSpanish = lang === "es";
  const currentLocale = isSpanish ? es : enUS;

  // 🛑 Mapear los procedimientos para la visualización de la UI
  const currentProcedures = useMemo(() => {
    return ALL_PROCEDURES.map(p => ({
        name: isSpanish ? p.name_es : p.name_en,
        icon: p.icon,
    }));
  }, [isSpanish]);
  

  // 🛑 1. Inicializar estado desde URL y traducir (Se ejecuta con searchParams o lang)
  useEffect(() => {
    const proceduresParam = searchParams.get("procedures");
    
    if (proceduresParam) {
      const namesFromUrl = proceduresParam.split(",");
      // CRITICAL LOGIC: Traducir de español (canónico de URL) al idioma de la UI
      const translatedNames = namesFromUrl
        .map(name => {
            const procedure = findProcedureByAnyName(name); 
            return procedure ? getProcedureName(procedure, lang) : null; 
        })
        .filter((name): name is string => name !== null);

      setSelectedProcedures(translatedNames);
    }
    
    const locationParam = searchParams.get("location");
    if (locationParam) {
      setLocation(locationParam);
    }

    const checkInParam = searchParams.get("checkIn");
    if (checkInParam) {
      // Usar parseISO o parse para mantener consistencia
      setStartDate(parse(checkInParam, "yyyy-MM-dd", new Date()));
    }

    const checkOutParam = searchParams.get("checkOut");
    if (checkOutParam) {
      setEndDate(parse(checkOutParam, "yyyy-MM-dd", new Date()));
    }

    const travelersParam = searchParams.get("travelers");
    if (travelersParam) {
      const travelersCount = Number.parseInt(travelersParam, 10);
      if (!isNaN(travelersCount) && travelersCount > 0) {
        setPatientCount(travelersCount);
      }
    }
  }, [searchParams, lang]); // Dependencia en lang para re-traducir si el idioma cambia


  // 🛑 2. Traducir el estado de procedimientos cuando el idioma (prop lang) cambia
  React.useEffect(() => {
    setSelectedProcedures(prevSelected => {
      if (prevSelected.length === 0) return prevSelected;

      const translated = prevSelected
        .map(oldName => {
          // Usar el nombre actual (en el idioma viejo) para encontrar el objeto
          const procedure = findProcedureByAnyName(oldName);
          // Obtener el nuevo nombre en el idioma actual (lang)
          return procedure ? getProcedureName(procedure, lang) : oldName;
        })
        .filter((name, index, self) => self.indexOf(name) === index);

      return translated;
    });
  }, [lang]); 

  const toggleProcedure = (procedureName: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(procedureName)
        ? prev.filter((name) => name !== procedureName)
        : [...prev, procedureName]
    );
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    // 🛑 CORE I18N LOGIC: Traducir de vuelta a la clave canónica (name_es) para la URL
    if (selectedProcedures.length > 0) {
      const spanishProcedureNames = selectedProcedures
        .map(displayName => {
          // Buscar el objeto Procedure usando el nombre que el usuario ve
          const procedure = findProcedureByAnyName(displayName);
          // Devolver el nombre en español (name_es) para la URL
          return procedure ? procedure.name_es : displayName; 
        })
        .filter((name, index, self) => self.indexOf(name) === index);
        
      params.append("procedures", spanishProcedureNames.join(","));
    }
    // ------------------------------------------------------------------

    if (location) {
      params.append("location", location);
    }

    if (startDate) {
      params.append("checkIn", format(startDate, "yyyy-MM-dd"));
    }

    if (endDate) {
      params.append("checkOut", format(endDate, "yyyy-MM-dd"));
    }

    params.append("travelers", patientCount.toString());

    router.push(`/${lang}/rooms?${params.toString()}`); // Añadir lang a la ruta
    onSearch();
  };

  // 🛑 Usar el locale correcto para formatear la fecha
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, isSpanish ? "d MMM" : "MMM d", { locale: currentLocale });
  };

  const handleReset = () => {
    setSelectedProcedures([]);
    setLocation("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPatientCount(1);
    router.push(`/${lang}/rooms`);
    onSearch();
  };

  const resetStartDate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStartDate(undefined);
  };

  const resetEndDate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEndDate(undefined);
  };

  return (
    <div className="md:hidden w-full max-w-[850px] mx-auto p-4 space-y-3 bg-[#39759E] rounded-b-xl">
      <div className="w-full">
        <label className="block text-sm mb-1 text-white">

          {isSpanish ? "Motivo médico" : "Medical reason"}
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-white hover:bg-white"
            >
              <span className="text-[#162F40]">
                {/* 🛑 Texto traducido para el contador */}
                {selectedProcedures.length > 0
                  ? isSpanish 
                    ? `${selectedProcedures.length} seleccionados` 
                    : `${selectedProcedures.length} selected`
                  : isSpanish 
                    ? "Tipo de intervención" 
                    : "Type of intervention"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(100vw-2rem)] bg-[#162F40] border-0">
            <div className="grid grid-cols-3 gap-2">
              {/* 🛑 Usar currentProcedures (ya traducido) */}
              {currentProcedures.map((procedure) => (
                <Button
                  key={procedure.name}
                  variant="ghost"
                  className={`flex flex-col items-center h-auto py-4 bg-transparent hover:bg-transparent ${
                    selectedProcedures.includes(procedure.name)
                      ? "text-[#EAFFF4] hover:text-[#EAFFF4]"
                      : "text-[#EAFFF4] hover:text-[#EAFFF4]"
                  }`}
                  onClick={() => toggleProcedure(procedure.name)}
                  data-state={
                    selectedProcedures.includes(procedure.name)
                      ? "active"
                      : "inactive"
                  }
                >
                  <div className="relative">
                    <Image
                      src={procedure.icon || "/placeholder.svg"}
                      alt={procedure.name}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    {selectedProcedures.includes(procedure.name) && (
                      <div className="absolute top-2 -right-6 bg-[#69C6FB] rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="font-light text-sm mt-2 px-4">
                    {procedure.name}
                  </span>
                </Button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full">
        <div className="py-1">
          <label className="block text-sm mb-1 text-white">
          
            {isSpanish ? "Lugar" : "Location"}
          </label>
          <LocationAutocomplete
            value={location}
            onChange={(newLocation) => {
              setLocation(newLocation);
            }}
            lang={lang} 
            // ✅ PASAR LA NUEVA PROP
            availableLocations={availableLocations} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <label className="block text-sm mb-1 text-white">
            {/* 🛑 Texto traducido */}
            {isSpanish ? "Llegada" : "Check-in"}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start bg-white hover:bg-white",
                  !startDate && "text-muted-foreground"
                )}
              >

                {startDate ? formatDate(startDate) : isSpanish ? "Elegir fecha" : "Choose date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                initialFocus
                disabled={(date) => date < new Date()}
                locale={currentLocale} 
              />
            </PopoverContent>
          </Popover>
          {startDate && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-6 p-4 text-gray hover:text-gray hover:bg-transparent"
              onClick={resetStartDate}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm mb-1 text-white">
           
            {isSpanish ? "Salida" : "Check-out"}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start bg-white hover:bg-white",
                  !endDate && "text-muted-foreground"
                )}
              >
                {/* 🛑 Placeholder traducido */}
                {endDate ? formatDate(endDate) : isSpanish ? "Elegir fecha" : "Choose date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                initialFocus
                disabled={(date) => date <= (startDate || new Date())}
                locale={currentLocale} 
              />
            </PopoverContent>
          </Popover>
          {endDate && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-6 p-4 text-gray hover:text-gray hover:bg-transparent"
              onClick={resetEndDate}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="w-full mx-auto flex flex-col items-center text-center mt-2">
        <label className="block text-sm mb-1 text-white">
         
          {isSpanish ? "Cantidad de personas" : "Number of people"}
        </label>
        <div className="rounded-md px-3 py-2">
          <NumberInput
            min={1}
            max={50}
            value={patientCount} // Controlado: siempre refleja el estado actual (URL o interacción)
            onChange={setPatientCount}
            className="text-white"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0 bg-white hover:bg-gray-100 text-[#162F40] border-0"
          onClick={handleReset}
          aria-label={isSpanish ? "Restablecer filtros" : "Reset filters"}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          className="flex-1 h-12 bg-[#1B2B3A] hover:bg-[#2C3E50] text-white flex items-center justify-center gap-2"
          onClick={handleSearch}
        >
          <Search className="w-5 h-5" />
          {isSpanish ? "Buscar" : "Search"}
        </Button>
      </div>
    </div>
  );
};

export default MedicalSearchMobile;