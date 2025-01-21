'use client';

import React, { useEffect, useState, useRef } from 'react';
import { uploadFile } from '@/services/fileUploadService'; // Servicio de carga
import { Camera, Loader2, XCircle } from 'lucide-react'; // Importar íconos de lucide-react
import styles from './GalleryUpload.module.css'; // Importar solo las animaciones

interface UploadedImage {
  id: string;
  filename_download: string;
}

interface GalleryUploadProps {
  initialIds?: string[];
  onGalleryChange?: (ids: string[]) => void;
}

const MAX_IMAGES = 6; // Límite máximo de imágenes

const GalleryUpload: React.FC<GalleryUploadProps> = ({ initialIds = [], onGalleryChange }) => {
  const [gallery, setGallery] = useState<UploadedImage[]>(
    initialIds.map((id) => ({ id, filename_download: `image-${id}` }))
  );
  const [loading, setLoading] = useState(false);
  const prevIdsRef = useRef<string[]>([]);

  // Actualizar el array de IDs en el componente padre si cambia la galería
  useEffect(() => {
    const newIds = gallery.map((image) => image.id);
    if (JSON.stringify(prevIdsRef.current) !== JSON.stringify(newIds)) {
      prevIdsRef.current = newIds;
      onGalleryChange?.(newIds);
    }
  }, [gallery, onGalleryChange]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || gallery.length >= MAX_IMAGES) return;

    setLoading(true);

    try {
      const response = await uploadFile(file);
      const newImage = {
        id: response.id,
        filename_download: response.filename_download,
      };

      setGallery((prevGallery) => [...prevGallery, newImage]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (id: string) => {
    const element = document.getElementById(`image-${id}`);
    if (element) {
      element.classList.add(styles.fadeOut);
      setTimeout(() => {
        setGallery((prevGallery) => prevGallery.filter((image) => image.id !== id));
      }, 500); // Duración de la animación
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subir Fotos</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gallery.map((image) => (
          <div
            key={image.id}
            id={`image-${image.id}`}
            className={`relative w-full h-48 border rounded-md overflow-hidden shadow-sm ${styles.fadeIn}`}
          >
            <img
              src={`https://us-east-1a.recoverycaresolutions.com/assets/${image.id}`}
              alt={image.filename_download}
              className="w-full h-full object-cover"
            />
            <button type="button"
              className="absolute top-2 right-2 bg-white rounded-full text-red-500 hover:text-red-600 shadow-md"
              onClick={() => handleRemoveImage(image.id)}
            >
              <XCircle size={24} />
            </button>
          </div>
        ))}

        {gallery.length < MAX_IMAGES && (
          <div className="relative w-full h-48 border-dashed border-2 border-gray-300 rounded-md flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <Camera size={32} className="text-gray-500" />
                <p className="text-sm text-gray-500">Agregar Imagen</p>
              </label>
            )}
          </div>
        )}
      </div>

      {gallery.length >= MAX_IMAGES && (
        <p className="text-sm text-red-500 mt-2">
          Puedes cargar máximo {MAX_IMAGES} imágenes.
        </p>
      )}
    </div>
  );
};

export default GalleryUpload;
