"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceButton } from "@/components/ui/service-button";

// ===============================================================
// 📚 Objeto de Traducciones
// ===============================================================

type TranslationText = {
  noTagsFound: string;
  listAriaLabel: string;
};

const translations: Record<string, TranslationText> = {
  es: {
    noTagsFound: "No se encontraron etiquetas de servicios.",
    listAriaLabel: "Lista de etiquetas de servicios",
  },
  en: {
    noTagsFound: "No service tags found.",
    listAriaLabel: "List of service tags",
  },
};
// ===============================================================

interface ServiceTag {
  id: string;
  name: string;      // Nombre en español (asumido)
  name_en: string;   // Nombre en inglés (asumido)
  icon: string;
}

interface ServiceTagsSelectorProps {
  onChange: (selectedTags: string[]) => void;
  initialSelectedTags?: string[];
  servicesTags: ServiceTag[];
  lang: string; // ✅ Añadida la prop lang para la localización
}

export function CollectionServiceTags({
  onChange,
  initialSelectedTags = [],
  servicesTags,
  lang, // ✅ Recibiendo lang
}: ServiceTagsSelectorProps) {

  // 🌐 Lógica de Idioma
  const currentLang = lang === 'es' ? 'es' : 'en';
  const texts = translations[currentLang];
  
  const [selectedTags, setSelectedTags] = useState<string[]>(
    // Limpiar valores vacíos en la inicialización
    initialSelectedTags.filter((tag) => tag.trim() !== "")
  );

  // 💡 Función para obtener el nombre traducido
  const getTagName = (tag: ServiceTag) => {
    if (currentLang === 'en' && tag.name_en) {
      return tag.name_en;
    }
    // Por defecto, usa 'name' (asumido como español) o 'name_en' como fallback.
    return tag.name || tag.name_en; 
  };

  const handleTagClick = (idTag: string) => {
    setSelectedTags((prevSelectedTags) => {
      let updatedTags: string[];
  
      if (idTag === "all-included") {
        // Si se selecciona "all-included", seleccionamos solo este y deseleccionamos el resto
        updatedTags = prevSelectedTags.includes("all-included") ? [] : ["all-included"];
      } else {
        // Si se selecciona otro tag, deseleccionamos "all-included"
        updatedTags = prevSelectedTags.includes(idTag)
          ? prevSelectedTags.filter((id) => id !== idTag)
          : prevSelectedTags.filter((id) => id !== "all-included").concat(idTag);
      }
  
      // Filtrar para evitar campos vacíos
      return updatedTags.filter((tag) => tag.trim() !== "");
    });
  };
  
  // Usamos useCallback para envolver onChange si no está ya envuelto, 
  // asegurando que la dependencia en useEffect sea estable.
  const stableOnChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    stableOnChange(selectedTags);
  }, [selectedTags, stableOnChange]);

  if (servicesTags.length === 0) {
    return (
      <div className="text-[#162F40] p-4 bg-gray-50 rounded-md">
        {texts.noTagsFound} {/* 👈 Traducido */}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4"
      role="list"
      aria-label={texts.listAriaLabel} /* 👈 Traducido */
    >
      {servicesTags.map((tag) => (
        <ServiceButton
          key={tag.id}
          id={tag.id}
          icon={tag.icon}
          label={getTagName(tag)} // 👈 Uso del nombre traducido
          selected={selectedTags.includes(tag.id)}
          onClick={() => handleTagClick(tag.id)}
          aria-pressed={selectedTags.includes(tag.id)} 
        />
      ))}
    </div>
  );
}