"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MultiImageUploaderWithIdsProps {
  maxImages?: number;
  onImagesChange?: (files: File[], existingIds: string[], markedForDeletion: string[]) => void;
  defaultImageIds?: string[];
}

type NewFile = {
  id: string;
  file: File;
  url: string;
};

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function MultiImageUploaderWithIds({
  maxImages = 6,
  onImagesChange,
  defaultImageIds = [],
}: MultiImageUploaderWithIdsProps) {
  // useRef para mantener los IDs existentes sin necesidad de estado reactivo
  const existingIdsRef = useRef<string[]>(defaultImageIds);
  const existingIds = existingIdsRef.current;

  const [newFiles, setNewFiles] = useState<NewFile[]>([]);
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(new Set());

  // Notificar al componente padre cada vez que cambien los archivos o los marcados para borrar
  useEffect(() => {
    onImagesChange?.(
      newFiles.map((n) => n.file),
      existingIds.filter((id) => !markedForDeletion.has(id)),
      Array.from(markedForDeletion)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFiles, markedForDeletion]);

  // Limpiar URLs al desmontar el componente
  useEffect(() => {
    return () => {
      newFiles.forEach((n) => URL.revokeObjectURL(n.url));
    };
  }, [newFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const visibleExistingCount = existingIds.filter((id) => !markedForDeletion.has(id)).length;
    const totalCurrentImages = visibleExistingCount + newFiles.length;
    const remainingSlots = Math.max(0, maxImages - totalCurrentImages);

    if (remainingSlots === 0) {
      e.target.value = "";
      return;
    }

    const validFiles = files
      .slice(0, remainingSlots)
      .filter((file) => file.type.startsWith("image/"));

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const mapped: NewFile[] = validFiles.map((file) => ({
      id: genId(),
      file,
      url: URL.createObjectURL(file),
    }));

    setNewFiles((prev) => [...prev, ...mapped]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const visibleExisting = existingIds.filter((id) => !markedForDeletion.has(id));
    if (index < visibleExisting.length) {
      // Marcar imagen existente para eliminación
      const idToRemove = visibleExisting[index];
      setMarkedForDeletion((prev) => new Set(prev).add(idToRemove));
      return;
    }

    // Eliminar imagen nueva
    const fileIndex = index - visibleExisting.length;
    setNewFiles((prev) => {
      const removed = prev[fileIndex];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== fileIndex);
    });
  };

  const visibleExisting = existingIds.filter((id) => !markedForDeletion.has(id));
  const totalImages = visibleExisting.length + newFiles.length;
  const canUploadMore = totalImages < maxImages;

  return (
    <div className="space-y-4">
      {canUploadMore && (
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="relative bg-transparent"
            onClick={() => document.getElementById("image-upload-ids")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
           Cargar
          </Button>
          <span className="text-sm text-muted-foreground">
            {totalImages} / {maxImages} fotos
            {visibleExisting.length > 0 && (
              <span className="ml-2 text-xs">
                ({visibleExisting.length} existentes, {newFiles.length} nuevas)
              </span>
            )}
          </span>
          <input
            id="image-upload-ids"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {totalImages > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-300">
          {visibleExisting.map((id, index) => (
            <div
              key={`existing-${id}`}
              className="relative aspect-square rounded-lg border border-border overflow-hidden group transition-all duration-300 ease-in-out animate-in fade-in zoom-in"
            >
              <Image
                src={`/webapi/assets/${id}?key=medium`}
                alt={`Existing image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 rounded-full p-1.5 transition-colors shadow-md bg-white text-gray-700 hover:bg-gray-100"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {newFiles.map((file, fileIndex) => {
            const displayIndex = visibleExisting.length + fileIndex;
            return (
              <div
                key={`new-${file.id}`}
                className="relative aspect-square rounded-lg border border-border overflow-hidden group transition-all duration-300 ease-in-out animate-in fade-in zoom-in"
              >
                <Image src={file.url} alt={`New image ${fileIndex + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(displayIndex)}
                  className="absolute top-2 right-2 rounded-full p-1.5 transition-colors shadow-md bg-white text-gray-700 hover:bg-gray-100"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById("image-upload-ids")?.click()}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">No hay fotos</p>
          <p className="text-xs text-muted-foreground">Puedes subir hasta {maxImages}</p>
        </div>
      )}
    </div>
  );
}
