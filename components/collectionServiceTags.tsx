"use client";

import { useState, useEffect } from "react";
import { ServiceButton } from "@/components/ui/service-button";

interface ServiceTag {
  id: string;
  name: string;
  icon: string;
}

interface ServiceTagsSelectorProps {
  onChange: (selectedTags: string[]) => void;
  initialSelectedTags?: string[];
  servicesTags: ServiceTag[]; // Recibimos las etiquetas de servicios como prop
}

export function CollectionServiceTags({
  onChange,
  initialSelectedTags = [],
  servicesTags,
}: ServiceTagsSelectorProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

  const handleTagClick = (idTag: string) => {
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(idTag)
        ? prevSelectedTags.filter((id) => id !== idTag)
        : [...prevSelectedTags, idTag]
    );
  };

  useEffect(() => {
    onChange(selectedTags);
  }, [selectedTags, onChange]);

  if (servicesTags.length === 0) {
    return (
      <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
        No se encontraron etiquetas de servicios.
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4"
      role="list"
      aria-label="Lista de etiquetas de servicios"
    >
      {servicesTags.map((tag) => (
        <ServiceButton
          key={tag.id}
          id={tag.id}
          icon={tag.icon}
          label={tag.name}
          selected={selectedTags.includes(tag.id)}
          onClick={() => handleTagClick(tag.id)}
          aria-pressed={selectedTags.includes(tag.id)} // Indicador accesible
        />
      ))}
    </div>
  );
}
