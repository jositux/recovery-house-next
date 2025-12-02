"use client";

import * as React from "react";
import { useState, Suspense, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Search, Check, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { NumberCounter } from "./number-counter";
import LocationAutocomplete from "@/components/ui/location-autocomplete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import styles from "./MedicalSearch.module.css";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

// Interface defining the structure for a procedure, including Spanish and English names.
interface Procedure {
  name_es: string; // Spanish name: used as the canonical key for the URL parameter
  name_en: string; // English name: used for display when lang is 'en'
  icon: string;
}

// Master list of procedures with names in both languages.
// name_es is the fixed key for the URL to ensure consistency across languages.
const ALL_PROCEDURES: Procedure[] = [
  { name_es: "Cirugía plástica", name_en: "Plastic surgery", icon: "/assets/icons/00.svg" },
  { name_es: "Cirugía bariátrica", name_en: "Bariatric surgery", icon: "/assets/icons/01.svg" },
  { name_es: "Implante capilar", name_en: "Hair transplant", icon: "/assets/icons/02.svg" },
  { name_es: "Salud mental", name_en: "Mental health", icon: "/assets/icons/03.svg" },
  { name_es: "Rehabilitación", name_en: "Rehabilitation", icon: "/assets/icons/04.svg" },
  { name_es: "Otro", name_en: "Other", icon: "/assets/icons/05.svg" },
];

// Utility function to get the procedure name based on the current UI language.
const getProcedureName = (procedure: Procedure, lang: string) => {
    return lang === 'es' ? procedure.name_es : procedure.name_en;
}

// Utility function to find a procedure object by its name in either Spanish or English.
// This is essential for mapping the displayed name (in state) back to the canonical object (for URL generation).
const findProcedureByAnyName = (name: string): Procedure | undefined => {
    return ALL_PROCEDURES.find(p => p.name_es === name || p.name_en === name);
}

interface SearchParamsHandlerProps {
  setSelectedProcedures: React.Dispatch<React.SetStateAction<string[]>>;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  setTravelers: React.Dispatch<React.SetStateAction<number>>;
  lang: string; // Current UI language
}

// Component responsible for reading URL search parameters and initializing the search state.
function SearchParamsHandler({
  setSelectedProcedures,
  setLocation,
  setDate,
  setTravelers,
  lang,
}: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const proceduresParam = searchParams.get("procedures");
    const locationParam = searchParams.get("location");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const travelersParam = searchParams.get("travelers");

    if (proceduresParam) {
      const namesFromUrl = proceduresParam.split(",");
      // CRITICAL LOGIC: Translate the names from the URL (which are always Spanish) 
      // back into the current UI language ('lang') for display in the input fields.
      const translatedNames = namesFromUrl
        .map(name => {
            // Find the procedure using the Spanish name from the URL.
            const procedure = findProcedureByAnyName(name); 
            // Translate the found procedure name to the current UI language (ES or EN)
            return procedure ? getProcedureName(procedure, lang) : null; 
        })
        .filter((name): name is string => name !== null); // Filter out any unknown names

      setSelectedProcedures(translatedNames);
    }

    if (locationParam) {
      setLocation(locationParam);
    }

    if (checkInParam) {
      const fromDate = parseISO(checkInParam);
      setDate((prev) => ({ ...prev, from: fromDate }));
    }

    if (checkOutParam) {
      const toDate = parseISO(checkOutParam);
      setDate((prev) => ({
        from: prev?.from ?? undefined,
        to: toDate,
      }));
    }

    if (travelersParam) {
      const travelersCount = Number.parseInt(travelersParam, 10);
      if (!isNaN(travelersCount) && travelersCount > 0) {
        setTravelers(travelersCount);
      }
    }
  // Rerun when searchParams or 'lang' changes to update displayed names if language is toggled.
  }, [searchParams, setDate, setLocation, setSelectedProcedures, setTravelers, lang]); 

  return null;
}

// Main search bar component.
export function SearchBar({ lang = "es" }: { lang?: string }) {
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  
  const isSpanish = lang === "es";

  // Use useMemo to efficiently calculate the list of procedures for the UI display,
  // ensuring the names are always in the current 'lang'.
  const currentProcedures = useMemo(() => {
      return ALL_PROCEDURES.map(p => ({
          name: isSpanish ? p.name_es : p.name_en,
          icon: p.icon,
      }));
  }, [isSpanish]);

  // useEffect to translate the currently selected procedures in the component state 
  // when the UI language ('lang') changes (e.g., from EN to ES).
  React.useEffect(() => {
    setSelectedProcedures(prevSelected => {
      if (prevSelected.length === 0) return prevSelected;

      const translated = prevSelected
        .map(oldName => {
          // Find the procedure object using the existing display name (oldName).
          const procedure = findProcedureByAnyName(oldName);
          // Get the new display name in the current 'lang'.
          return procedure ? getProcedureName(procedure, lang) : oldName;
        })
        .filter((name, index, self) => self.indexOf(name) === index);

      return translated;
    });
  }, [lang]); 

  const [travelers, setTravelers] = React.useState(1);
  const [location, setLocation] = React.useState("");

  // Toggles the selection state. The state holds the name in the CURRENT UI language.
  const toggleProcedure = (procedureName: string) => {
    setSelectedProcedures((prev) => {
      return prev.includes(procedureName)
        ? prev.filter((name) => name !== procedureName)
        : [...prev, procedureName];
    });
  };

  const resetDates = () => setDate(undefined);
  const resetTravelers = () => setTravelers(1);

  const router = useRouter();

  // Handles search submission, building the URL with consistent parameters.
  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    // --- KEY BLOCK: FORCE TRANSLATION TO SPANISH FOR URL CONSISTENCY ---
    if (selectedProcedures.length > 0) {
      const spanishProcedureNames = selectedProcedures
        .map(displayName => {
          // 1. Find the master procedure object using the name currently visible in the UI (displayName, which is ES or EN).
          const procedure = findProcedureByAnyName(displayName);
          // 2. Return the Spanish name (name_es) for the URL parameter. 
          // THIS IS THE CORE REQUIREMENT: ensures the URL value is consistently Spanish (e.g., procedures=Cirugía%20plástica)
          // regardless of whether the user saw "Plastic surgery" or "Cirugía plástica" when clicking the button.
          return procedure ? procedure.name_es : displayName; 
        })
        .filter((name, index, self) => self.indexOf(name) === index); // Ensure uniqueness
        
      searchParams.append("procedures", spanishProcedureNames.join(","));
    }
    // ------------------------------------------------------------------
    
    if (location) {
      searchParams.append("location", location);
    }
    if (date?.from) {
      // Store dates in ISO format (YYYY-MM-DD)
      searchParams.append("checkIn", date.from.toISOString().split("T")[0]);
    }
    if (date?.to) {
      searchParams.append("checkOut", date.to.toISOString().split("T")[0]);
    }
    if (travelers > 1) {
      searchParams.append("travelers", travelers.toString());
    }

    const searchUrl = `/${lang}/rooms?${searchParams.toString()}`;
    router.push(searchUrl);
  };

  return (
    <>
      {/* Suspense wrapper for Next.js hooks */}
      <Suspense fallback={null}>
        <SearchParamsHandler
          setSelectedProcedures={setSelectedProcedures}
          setLocation={setLocation}
          setDate={setDate}
          setTravelers={setTravelers}
          lang={lang} // Pass the language for proper URL-to-state translation
        />
      </Suspense>
      <div
        className={`${styles.Content} hidden relative z-100 lg:mt-[-50px] lg:block w-full max-w-[820px] mx-auto bg-[#1B2B3A] rounded-3xl`}
      >
        <div className="px-8 bg-[#1B2B3A] rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <h2 className="text-white leading-[1.2rem] font-medium text-sm whitespace-nowrap">
              {/* Conditional text based on language */}
              {isSpanish ? (
                <>
                  Motivo médico <br />
                  de tu viaje
                </>
              ) : (
                <>
                  Medical reason <br />
                  for your trip
                </>
              )}
            </h2>
            <div className="grid grid-cols-6 md:grid-cols-6 gap-10 flex-1">
              {/* Procedure selection buttons */}
              {currentProcedures.map((procedure) => (
                <Button
                  key={procedure.name}
                  variant="ghost"
                  className={`flex flex-col items-center space-y-0 h-auto py-4 bg-transparent hover:bg-transparent ${
                    selectedProcedures.includes(procedure.name)
                      ? "text-white hover:text-white"
                      : "text-white hover:text-white"
                  }`}
                  onClick={() => toggleProcedure(procedure.name)}
                >
                  <div className="relative">
                    <Image
                      src={procedure.icon || "/placeholder.svg"}
                      alt={procedure.name}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    {/* Checkmark icon for selected procedures */}
                    {selectedProcedures.includes(procedure.name) && (
                      <div className="absolute top-2 -right-6 bg-[#69C6FB] rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="font-light">{procedure.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center px-6 gap-1 p-2 bg-white rounded-2xl shadow-lg border">
          {/* Location Input */}
          <div className="relative flex-1">
            <div className="py-1">
              <div className="text-sm font-semibold mb-1">
                {isSpanish ? "Lugar" : "Location"}
              </div>
              <LocationAutocomplete
                value={location}
                onChange={(newLocation) => {
                  setLocation(newLocation);
                }}
                lang={lang}
              />
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Check-in/Check-out Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex-1 flex cursor-pointer rounded-full hover:bg-gray-100 px-6 py-3 relative">
                <div className="grid grid-cols-2 gap-4 min-w-[200px]">
                  <div>
                    <div className="text-sm font-semibold">
                      {isSpanish ? "Llegada" : "Check-in"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {date?.from
                        ? format(date.from, isSpanish ? "d MMM." : "MMM d", {
                            locale: isSpanish ? es : enUS,
                          })
                        : isSpanish
                        ? "Agregar fecha"
                        : "Add date"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {isSpanish ? "Salida" : "Check-out"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {date?.to
                        ? format(date.to, isSpanish ? "d MMM." : "MMM d", {
                            locale: isSpanish ? es : enUS,
                          })
                        : isSpanish
                        ? "Agregar fecha"
                        : "Add date"}
                    </div>
                  </div>
                </div>
                {/* Reset dates button */}
                {date && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
                    onClick={resetDates}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={isSpanish ? es : enUS}
                disabled={{ before: new Date() }} // Disable past dates
              />
            </PopoverContent>
          </Popover>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Travelers Counter */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <div className="cursor-pointer rounded-full hover:bg-gray-100 px-6 py-3">
                  <div className="text-sm font-semibold">
                    {isSpanish ? "Quién" : "Who"}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {travelers}{" "}
                    {isSpanish
                      ? travelers === 1
                        ? "paciente"
                        : "pacientes"
                      : travelers === 1
                      ? "patient"
                      : "patients"}
                  </div>
                  {/* Reset travelers button */}
                  {travelers > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
                      onClick={resetTravelers}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {isSpanish ? "Pacientes" : "Patients"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isSpanish ? "Cantidad de personas" : "Number of people"}
                  </div>
                </div>
                <NumberCounter
                  value={travelers}
                  onChange={setTravelers}
                  min={1}
                  max={16}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <Button
            size="icon"
            className="rounded-full w-12 h-12 bg-[#1B2B3A] hover:bg-[#1B2B3A]/90"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </>
  );
}