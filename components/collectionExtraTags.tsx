import { useState, useEffect, useCallback } from "react";
import { TagButton } from "@/components/ui/tag-button";

interface ExtraTag {
  id: string;
  name: string;
  icon: string;
  enable_property: boolean;
  enable_services: boolean;
}

interface ExtraTagsSelectorProps {
  onChange: (selectedTags: string[]) => void;
  initialSelectedTags?: string[];
  extraTags: ExtraTag[];
  enable: string;
}

export function CollectionExtraTags({
  onChange,
  initialSelectedTags = [],
  extraTags,
  enable,
}: ExtraTagsSelectorProps) {
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

  // Evita que `onChange` se ejecute en cada render
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
        No se encontraron etiquetas adicionales.
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4"
      role="list"
      aria-label="Lista de etiquetas adicionales"
    >
      {filteredTags.map((tag) => (
        <TagButton
          key={tag.id}
          id={tag.id}
          icon={tag.icon}
          label={tag.name}
          selected={selectedTags.includes(tag.id)}
          onClick={() => handleTagClick(tag.id)}
          aria-pressed={selectedTags.includes(tag.id)}
        />
      ))}
    </div>
  );
}
