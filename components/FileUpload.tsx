import React, { ChangeEvent, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadFile } from "@/services/fileUploadService";

interface FileUploadProps {
  id: string;
  filename_download?: string; // Hacer que sea opcional si no se usa
  onUploadSuccess?: (response: { id: string; filename_download: string }) => void;
  onClearFile?: () => void; // Nueva prop para manejar el reset desde el padre
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  filename_download,
  onUploadSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setLoading(true);
      setFileName(file.name);

      try {
        const response = await uploadFile(file);

        if (onUploadSuccess) {
          onUploadSuccess(response);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setLoading(false);
      }
    }
  };

 

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-md shadow-md w-full max-w-md bg-white">
     
      {/* Input de archivo */}
      <label
        htmlFor={`file-upload-${id}`}
        className="flex items-center justify-between w-full p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
      >
        <span>{filename_download || fileName || "Upload a File"}</span>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        ) : (
          <Upload className="w-5 h-5 text-gray-600" />
        )}
      </label>

      <input
        id={`file-upload-${id}`}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        disabled={loading}
      />

     
    </div>
  );
};

export default FileUpload;
