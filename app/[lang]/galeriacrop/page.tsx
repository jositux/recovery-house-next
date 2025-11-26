"use client";

import { useState } from "react";
import { SingleImageUploaderWithCrop } from "./single-image-uploader-with-crop";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/services/fileUploadService";
import { deleteFile } from "@/services/deleteFileService";
import { Loader2, Copy, Check } from "lucide-react";
import Image from "next/image";

export default function GalleryCropPage() {
  const [existingImageId, setExistingImageId] = useState<string>(
    "ddcf8c6d-93d6-4934-880f-e1e98c4ff51c"
  );
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [shouldDeleteExisting, setShouldDeleteExisting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [finalImageId, setFinalImageId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (file: File | null) => {
    setNewImageFile(file);
    setFinalImageId(null);
  };

  const handleMarkForDeletion = (id: string, marked: boolean) => {
    setShouldDeleteExisting(marked);
  };

  const handleSave = async () => {
    setIsUploading(true);
    const accessToken = localStorage.getItem("access_token");

    try {
      if (shouldDeleteExisting && existingImageId && accessToken) {
        try {
          await deleteFile(existingImageId, accessToken);
          toast({
            title: "Imagen eliminada",
            description: "La imagen anterior se eliminó del servidor",
          });
          setExistingImageId("");
          setShouldDeleteExisting(false);
        } catch (error) {
          console.error("Error deleting image:", error);
          toast({
            title: "Error al eliminar",
            description: "No se pudo eliminar la imagen anterior",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }

      if (newImageFile) {
        try {
          const result = await uploadFile(newImageFile);
          setFinalImageId(result.id);
          setExistingImageId(result.id);
          setNewImageFile(null);

          toast({
            title: "¡Éxito!",
            description: "La imagen se guardó correctamente",
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Error",
            description: "No se pudo subir la imagen",
            variant: "destructive",
          });
        }
      } else if (!shouldDeleteExisting) {
        toast({
          title: "Sin cambios",
          description: existingImageId
            ? "La imagen existente se mantendrá"
            : "No hay imagen para guardar",
        });
        setFinalImageId(existingImageId || null);
      } else {
        toast({
          title: "Imagen eliminada",
          description: "La imagen se eliminó correctamente",
        });
        setFinalImageId(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (finalImageId) {
      navigator.clipboard.writeText(finalImageId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiado",
        description: "ID copiado al portapapeles",
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Galería con Recorte</h1>
        <p className="text-muted-foreground">
          Sube y recorta una imagen. Las imágenes se marcan para eliminar y se
          eliminan al hacer click en Guardar.
        </p>
      </div>

      <SingleImageUploaderWithCrop
        existingImageId={existingImageId}
        onImageChange={handleImageChange}
        onMarkForDeletion={handleMarkForDeletion}
        aspectRatio={1}
      />

      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={isUploading}
          size="lg"
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {shouldDeleteExisting && !newImageFile
                ? "Eliminando..."
                : "Guardando..."}
            </>
          ) : (
            "Guardar"
          )}
        </Button>
      </div>

      {finalImageId && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
            <CardDescription>
              ID de la imagen guardada en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono">
                {finalImageId}
              </code>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Vista previa:
              </p>
              <Image
  src={`/webapi/assets/${finalImageId}?key=small`}
  alt="Saved"
  width={192}  /* equivalente a w-48 (48 * 4 = 192px) */
  height={192} /* equivalente a h-48 */
  className="object-cover rounded-lg border"
/>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>ID Existente:</strong> {existingImageId || "Ninguno"}
          </p>
          <p>
            <strong>Nueva Imagen:</strong>{" "}
            {newImageFile ? newImageFile.name : "Ninguna"}
          </p>
          <p className="text-muted-foreground">
            Al hacer click en X, la imagen desaparece de la UI. Al hacer click
            en Guardar, se elimina del servidor y se sube la nueva imagen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
