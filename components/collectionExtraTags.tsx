"use client";

import { useState, useEffect, useCallback } from "react";
import { TagButton } from "@/components/ui/tag-button";

// ===============================================================
// 📚 Objeto de Traducciones
// ===============================================================

type TranslationText = {
  noTagsFound: string;
  listAriaLabel: string;
};

const translations: Record<string, TranslationText> = {
  es: {
    noTagsFound: "No se encontraron etiquetas adicionales.",
    listAriaLabel: "Lista de etiquetas adicionales",
  },
  en: {
    noTagsFound: "No additional tags found.",
    listAriaLabel: "List of additional tags",
  },
};
// ===============================================================


interface ExtraTag {
  id: string;
  name: string;      // ✅ Nombre en español (asumido)
  name_en: string;   // ✅ Nuevo campo para el nombre en inglés
  icon: string;
  enable_property: boolean;
  enable_services: boolean;
}

interface ExtraTagsSelectorProps {
  onChange: (selectedTags: string[]) => void;
  initialSelectedTags?: string[];
  extraTags: ExtraTag[];
  enable: string;
  lang: string; 
}

export function CollectionExtraTags({
  onChange,
  initialSelectedTags = [],
  extraTags,
  enable,
  lang, 
}: ExtraTagsSelectorProps) {
  
  // 🌐 Lógica de Idioma
  const currentLang = lang === 'es' ? 'es' : 'en';
  const texts = translations[currentLang];

  // Limpia valores vacíos en la inicialización
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialSelectedTags.filter((tag) => tag.trim() !== "")
  );

  const handleTagClick = (idTag: string) => {
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(idTag)
        ? prevSelectedTags.filter((id) => id !== idTag)
        : [...prevSelectedTags, idTag]
    );
  };

  const stableOnChange = useCallback(onChange, []);

  useEffect(() => {
    stableOnChange(selectedTags);
  }, [selectedTags, stableOnChange]);

  // Filtra las etiquetas según la propiedad "enable"
  const filteredTags = extraTags.filter((tag) => {
    if (enable === "property") return tag.enable_property;
    if (enable === "services") return tag.enable_services;
    return true;
  });

  if (filteredTags.length === 0) {
    return (
      <div className="text-[#162F40] p-4 bg-gray-50 rounded-md">
        {texts.noTagsFound}
      </div>
    );
  }
  
  // 💡 Función para obtener el nombre traducido
  const getTagName = (tag: ExtraTag) => {
    if (currentLang === 'en' && tag.name_en) {
      return tag.name_en;
    }
    // Por defecto, usa 'name' (asumido como español) o 'name_en' si no hay 'name'.
    return tag.name || tag.name_en; 
  };

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4"
      role="list"
      aria-label={texts.listAriaLabel}
    >
      {filteredTags.map((tag) => (
        <TagButton
          key={tag.id}
          id={tag.id}
          icon={tag.icon}
          label={getTagName(tag)} // 👈 Asignación dinámica del nombre
          selected={selectedTags.includes(tag.id)}
          onClick={() => handleTagClick(tag.id)}
          aria-pressed={selectedTags.includes(tag.id)}
        />
      ))}
    </div>
  );
}