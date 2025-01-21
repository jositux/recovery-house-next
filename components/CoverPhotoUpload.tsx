'use client';

import React, { useState, useEffect } from 'react';
import { uploadFile } from '@/services/fileUploadService'; // Servicio de subida
import { Camera, Loader2, XCircle } from 'lucide-react'; // Iconos

interface CoverPhotoUploadProps {
  defaultImageId?: string; // ID de imagen predeterminada
  onImageIdChange?: (id: string) => void; // Callback para emitir el id al componente padre
}

const CoverPhotoUpload: React.FC<CoverPhotoUploadProps> = ({ defaultImageId = "", onImageIdChange }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [imageId, setImageId] = useState<string>(defaultImageId);

  // Notifica al componente padre cuando el imageId cambia
  useEffect(() => {
    if (onImageIdChange) {
      onImageIdChange(imageId);
    }
  }, [imageId, onImageIdChange]);

  // Maneja la subida de archivos
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImageId(""); // Reinicia el id previo

    try {
      const response = await uploadFile(file);
      setImageId(response.id); // Guarda el id retornado
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  // Maneja el "clear" de la imagen
  const handleClearImage = (): void => {
    setImageId("");
  };

  return (
    <div className="relative w-full max-w-4xl h-64 border-2 border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
      {/* Input de archivo oculto */}
      <input
        type="file"
        id="cover-photo-upload"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />

      {/* Imagen cargada o ícono de la cámara */}
      {imageId ? (
        <>
          {/* Imagen cargada */}
          <img
            src={`https://us-east-1a.recoverycaresolutions.com/assets/${imageId}`}
            alt="Cover Photo"
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />

          {/* Botón para limpiar imagen */}
          <button
            onClick={handleClearImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 hover:text-red-600 shadow-md"
            aria-label="Clear image"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </>
      ) : (
        <label
          htmlFor="cover-photo-upload"
          className="flex flex-col items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          ) : (
            <Camera className="w-10 h-10 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-500">COVER PHOTO</span>
        </label>
      )}
    </div>
  );
};

export default CoverPhotoUpload;
