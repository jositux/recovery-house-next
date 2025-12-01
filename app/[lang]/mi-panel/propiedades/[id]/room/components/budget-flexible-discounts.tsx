"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";

// --- Stay Range Interface (Kept as is) ---

interface StayRange {
  min: number;
  max: number | null;
}

// --- Translation Interfaces and Data ---

interface DiscountTranslation {
  title: string;
  shortStay: string;
  mediumStay: string;
  longStay: string;
  noDiscount: string;
  discountPlaceholder: string;
  savings: (discount: string) => string;
  defaultDiscount: (discount: string) => string;
  longStayExtra: string;
  nightRangePlural: string;
  nightRangeSingular: string;
  nightRangePlus: string;
}

const translations: Record<string, DiscountTranslation> = {
  es: {
    title: "Descuentos por Duración de Estadía",
    shortStay: "Estadía Corta",
    mediumStay: "Estadía Media",
    longStay: "Estadía Larga",
    noDiscount: "Sin descuento",
    discountPlaceholder: "Seleccionar descuento",
    savings: (discount: string) => `Ahorro: ${discount}% sobre el total`,
    defaultDiscount: (discount: string) => `Descuento predeterminado: ${discount}%`,
    longStayExtra: " + 1 modificación gratuita",
    nightRangePlural: "noches",
    nightRangeSingular: "noche",
    nightRangePlus: "noches",
  },
  en: {
    title: "Stay Duration Discounts",
    shortStay: "Short Stay",
    mediumStay: "Medium Stay",
    longStay: "Long Stay",
    noDiscount: "No discount",
    discountPlaceholder: "Select discount",
    savings: (discount: string) => `Savings: ${discount}% of the total`,
    defaultDiscount: (discount: string) => `Default discount: ${discount}%`,
    longStayExtra: " + 1 free modification",
    nightRangePlural: "nights",
    nightRangeSingular: "night",
    nightRangePlus: "nights",
  },
};

// --- Component Props Update ---

interface BudgetFlexibleDiscountsProps {
  shortStayDiscount: string;
  setShortStayDiscount: (value: string) => void;
  mediumStayDiscount: string;
  setMediumStayDiscount: (value: string) => void;
  longStayDiscount: string;
  setLongStayDiscount: (value: string) => void;
  shortStayDiscounts?: string[];
  mediumStayDiscounts?: string[];
  longStayDiscounts?: string[];
  defaultShortStayDiscount?: string;
  defaultMediumStayDiscount?: string;
  defaultLongStayDiscount?: string;
  shortStayRange?: StayRange;
  mediumStayRange?: StayRange;
  longStayRange?: StayRange;
  // Added 'lang' prop
  lang: string;
}

export function BudgetFlexibleDiscounts({
  //shortStayDiscount, // Kept commented as in original
  //setShortStayDiscount, // Kept commented as in original
  mediumStayDiscount,
  setMediumStayDiscount,
  longStayDiscount,
  setLongStayDiscount,
  shortStayDiscounts = ["0"],
  mediumStayDiscounts = ["0", "5", "10", "15"],
  longStayDiscounts = ["0", "15", "20"],
  defaultShortStayDiscount = "0",
  defaultMediumStayDiscount = "0",
  defaultLongStayDiscount = "0",
  shortStayRange = { min: 1, max: 5 },
  mediumStayRange = { min: 6, max: 9 },
  longStayRange = { min: 10, max: null },
  lang,
}: BudgetFlexibleDiscountsProps) {
  
  // 1. Select the current translation based on the lang prop
  const currentLangKey = lang.toLowerCase().startsWith("es") ? "es" : "en";
  const t = translations[currentLangKey];

  // 2. Updated formatNightRange to use translation keys
  const formatNightRange = (range: StayRange): string => {
    if (range.max === null || range.max === 1000000) {
      return `+${range.min} ${t.nightRangePlus}`;
    }
    if (range.min === range.max) {
      return `${range.min} ${range.min > 1 ? t.nightRangePlural : t.nightRangeSingular}`;
    }
    return `${range.min}-${range.max} ${t.nightRangePlural}`;
  };

  return (
    <div className="p-4 bg-white rounded-xl">
      {/* Título principal */}
      <div className="border-b border-gray-100 pb-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          {t.title}
        </h3>
      </div>

      {/* Estadía Corta */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <div>
              <span className="font-medium text-gray-800 text-sm">{t.shortStay}</span>
              <span className="text-xs text-gray-600 ml-2">({formatNightRange(shortStayRange)})</span>
            </div>
          </div>
          {shortStayDiscounts.length === 1 && shortStayDiscounts[0] === "0" ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {t.noDiscount}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {defaultShortStayDiscount === "0" 
                ? t.noDiscount 
                : `${defaultShortStayDiscount}% ${t.noDiscount === "Sin descuento" ? "descuento" : "discount"}`} {/* Simple fallback for 'discount' word */}
            </span>
          )}
        </div>
      </div>

      {/* Estadías Media y Larga */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Media */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <span className="font-medium text-gray-800 text-sm">
                  {t.mediumStay}
                </span>
                <span className="text-xs text-gray-600 ml-1">
                  ({formatNightRange(mediumStayRange)})
                </span>
              </div>
            </div>

            <Select
              value={mediumStayDiscount}
              onValueChange={setMediumStayDiscount}
            >
              <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 h-8 text-sm">
                <SelectValue placeholder={t.discountPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {mediumStayDiscounts.map((discount) => (
                  <SelectItem key={discount} value={discount}>
                    {discount === "0"
                      ? t.noDiscount
                      : `${discount}% de ${t.noDiscount === "Sin descuento" ? "descuento" : "discount"}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {mediumStayDiscount !== "0" ? (
              <div className="bg-blue-100 p-2 rounded text-xs text-blue-800">
                {t.savings(mediumStayDiscount)}
              </div>
            ) : (
              defaultMediumStayDiscount !== "0" && (
                <div className="bg-blue-100 p-2 rounded text-xs text-blue-800">
                  {t.defaultDiscount(defaultMediumStayDiscount)}
                </div>
              )
            )}
          </div>
        </div>

        {/* Larga */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <span className="font-medium text-gray-800 text-sm">
                  {t.longStay}
                </span>
                <span className="text-xs text-gray-600 ml-1">
                  ({formatNightRange(longStayRange)})
                </span>
              </div>
            </div>

            <Select
              value={longStayDiscount}
              onValueChange={setLongStayDiscount}
            >
              <SelectTrigger className="bg-white border-purple-200 focus:border-purple-400 h-8 text-sm">
                <SelectValue placeholder={t.discountPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {longStayDiscounts.map((discount) => (
                  <SelectItem key={discount} value={discount}>
                    {discount === "0"
                      ? t.noDiscount
                      : `${discount}% de ${t.noDiscount === "Sin descuento" ? "descuento" : "discount"}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {longStayDiscount !== "0" ? (
              <div className="bg-purple-100 p-2 rounded text-xs text-purple-800">
                <strong>{t.savings(longStayDiscount).split(':')[0]}:</strong> {/* Use the 'Ahorro' part of savings */}
                {longStayDiscount}%
                {t.longStayExtra}
              </div>
            ) : (
              defaultLongStayDiscount !== "0" && (
                <div className="bg-purple-100 p-2 rounded text-xs text-purple-800">
                  {t.defaultDiscount(defaultLongStayDiscount)}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}