"use client";

import { useState, useEffect } from "react";
import { TagButton } from "@/components/ui/tag-button";

interface ExtraTag {
  id: string;
  name: string;
  icon: string;
}

interface ExtraTagsSelectorProps {
  onChange: (selectedTags: string[]) => void;
  initialSelectedTags?: string[];
  extraTags: ExtraTag[];
}

export function CollectionExtraTags({
  onChange,
  initialSelectedTags = [],
  extraTags,
}: ExtraTagsSelectorProps) {
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

  if (extraTags.length === 0) {
    return (
      <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
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
      {extraTags.map((tag) => (
        <TagButton
          key={tag.id}
          id={tag.id}
          icon={tag.icon}
          label={tag.name}
          selected={selectedTags.includes(tag.id)}
          onClick={() => handleTagClick(tag.id)}
          aria-pressed={selectedTags.includes(tag.id)} // Indica accesibilidad
        />
      ))}
    </div>
  );
}
