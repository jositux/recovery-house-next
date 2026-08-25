"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { X, Upload, ImageIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getAssetUrl } from "@/lib/getAssetUrl";

// --- Translation Interfaces and Data ---

interface ImageUploaderTranslation {
  uploadButton: string;
  imageCountLabel: string;
  existingCount: string;
  newCount: string;
  removeAria: string;
  noImagesTitle: string;
  noImagesSubtitle: (max: number) => string;
  maxReachedError: (max: number) => string;
  invalidFileError: (filename: string) => string;
  errorTitle: string;
}

const translations: Record<string, ImageUploaderTranslation> = {
  es: {
    uploadButton: "Cargar Fotos",
    imageCountLabel: "fotos",
    existingCount: "existentes",
    newCount: "nuevas",
    removeAria: "Eliminar foto",
    noImagesTitle: "No hay fotos",
    noImagesSubtitle: (max: number) => `Puedes subir hasta ${max} fotos`,
    maxReachedError: (max: number) =>
      `Límite alcanzado. Solo puedes tener ${max} fotos en total.`,
    invalidFileError: (filename: string) =>
      `${filename} no es una imagen válida.`,
    errorTitle: "Error de Carga",
  },
  en: {
    uploadButton: "Upload Photos",
    imageCountLabel: "photos",
    existingCount: "existing",
    newCount: "new",
    removeAria: "Remove photo",
    noImagesTitle: "No photos uploaded yet",
    noImagesSubtitle: (max: number) => `You can upload up to ${max} photos`,
    maxReachedError: (max: number) =>
      `Limit reached. You can only have ${max} photos in total.`,
    invalidFileError: (filename: string) =>
      `${filename} is not a valid image.`,
    errorTitle: "Upload Error",
  },
};

// --- Component Interfaces and Types (Kept as is) ---

interface MultiImageUploaderWithIdsProps {
  maxImages?: number;
  onImagesChange?: (
    files: File[],
    existingIds: string[],
    markedForDeletion: string[]
  ) => void;
  defaultImageIds?: string[];
  // Added 'lang' prop
  lang: string;
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
  lang,
}: MultiImageUploaderWithIdsProps) {
  
  // Select the current translation object
  const currentLangKey = lang.toLowerCase().startsWith("es") ? "es" : "en";
  const t = translations[currentLangKey];
  
  // Refs and States
  const existingIdsRef = useRef<string[]>(defaultImageIds);
  const existingIds = existingIdsRef.current;

  const [newFiles, setNewFiles] = useState<NewFile[]>([]);
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(
    new Set()
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    setUploadError(null); // Clear previous errors

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const visibleExistingCount = existingIds.filter(
      (id) => !markedForDeletion.has(id)
    ).length;
    const totalCurrentImages = visibleExistingCount + newFiles.length;
    const remainingSlots = Math.max(0, maxImages - totalCurrentImages);
    
    // Check if max capacity is reached before processing files
    if (remainingSlots === 0) {
      setUploadError(t.maxReachedError(maxImages));
      e.target.value = "";
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    
    const validFiles: File[] = [];
    let hasInvalidFile = false;
    let invalidFileName = "";

    filesToProcess.forEach((file) => {
      if (file.type.startsWith("image/")) {
        validFiles.push(file);
      } else {
        if (!hasInvalidFile) {
          invalidFileName = file.name;
        }
        hasInvalidFile = true;
      }
    });

    if (hasInvalidFile) {
        setUploadError(t.invalidFileError(invalidFileName));
    }

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
    setUploadError(null); // Clear errors when interacting
    
    const visibleExisting = existingIds.filter(
      (id) => !markedForDeletion.has(id)
    );
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

  const visibleExisting = existingIds.filter(
    (id) => !markedForDeletion.has(id)
  );
  const totalImages = visibleExisting.length + newFiles.length;
  const canUploadMore = totalImages < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Button Section */}
      <div className="flex items-center gap-4">
        {canUploadMore && (
          <Button
            type="button"
            variant="outline"
            className="relative bg-transparent"
            onClick={() => document.getElementById("image-upload-ids")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {t.uploadButton}
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          {totalImages} / {maxImages} {t.imageCountLabel}
          {(visibleExisting.length > 0 || newFiles.length > 0) && (
            <span className="ml-2 text-xs">
              ({visibleExisting.length} {t.existingCount}, {newFiles.length}{" "}
              {t.newCount})
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

      {/* Error Message Display */}
      {uploadError && (
        <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="font-semibold">{t.errorTitle}:</span> {uploadError}
        </div>
      )}

      {/* Image Previews */}
      {totalImages > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-300">
          {visibleExisting.map((id, index) => (
            <div
              key={`existing-${id}`}
              className="relative aspect-square rounded-lg border border-border overflow-hidden group transition-all duration-300 ease-in-out animate-in fade-in zoom-in"
            >
              {/* NOTE: Assuming the base URL for existing images */}
              <Image
                src={getAssetUrl(id, "medium")}
                alt={`Existing image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 rounded-full p-1.5 transition-colors shadow-md bg-white text-gray-700 hover:bg-gray-100"
                aria-label={t.removeAria}
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
                <Image
                  src={file.url}
                  alt={`New image ${fileIndex + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(displayIndex)}
                  className="absolute top-2 right-2 rounded-full p-1.5 transition-colors shadow-md bg-white text-gray-700 hover:bg-gray-100"
                  aria-label={t.removeAria}
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
          <p className="text-sm text-muted-foreground mb-2">{t.noImagesTitle}</p>
          <p className="text-xs text-muted-foreground">
            {t.noImagesSubtitle(maxImages)}
          </p>
        </div>
      )}
    </div>
  );
}