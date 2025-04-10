"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Image upload components and services
import { ProfileImageUploader } from "../profile/ProfileImageUploader";
import { uploadBase64ToDirectus } from "@/services/uploadAvatarService";

// User data services
import { getCurrentUser, type User } from "@/services/userService";
import {
  updateService,
  UpdateUserCredentials,
} from "@/services/updateUserService";

// Form component
import UpdateUserForm from "@/components/forms/UpdateUserForm";

import { logoutUser } from "@/services/LogoutService";

// Define schema for the update form (from mi-perfil)
const updatedFormSchema = z.object({
  id: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  first_name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  last_name: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres.",
  }),
  birthDate: z.string(),
  email: z.string(),
  phone: z.string().min(2, {
    message: "El Teléfono debe tener al menos 2 caracteres.",
  }),
  emergencyPhone: z.string().min(0, {
    message: "El Teléfono debe tener al menos 2 caracteres.",
  }),
  address: z.string().min(2, {
    message: "El domicilio debe tener al menos 2 caracteres.",
  }),
  password: z.string().optional(),
});

export default function CombinedProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const processedImages = useRef(new Set<string>());

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageSuccessMessage, setImageSuccessMessage] = useState<string | null>(null);
  const [messageTimer, setMessageTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setAccessToken(token);

    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);

        if (userData.avatar) {
          setAvatarId(userData.avatar);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

        let errorMessage = "Error inesperado";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        showTemporaryMessage(null, errorMessage);

        if (errorMessage.includes("Token")) {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const showTemporaryMessage = (
    successMsg: string | null,
    errorMsg: string | null,
    duration: number = 10000
  ): void => {
    if (messageTimer) {
      clearTimeout(messageTimer);
    }

    setSuccessMessage(successMsg);
    setError(errorMsg);

    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, duration);

    setMessageTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (messageTimer) {
        clearTimeout(messageTimer);
      }
    };
  }, [messageTimer]);

  const handleCroppedImage = (image: string) => {
    setCroppedImageUrl(image);
  };

  useEffect(() => {
    if (!croppedImageUrl || !accessToken || isUploading) return;

    if (processedImages.current.has(croppedImageUrl)) return;

    setIsUploading(true);
    processedImages.current.add(croppedImageUrl);

    const uploadAvatar = async () => {
      try {
        const id = await uploadBase64ToDirectus(croppedImageUrl, accessToken);
        if (id) {
          setAvatarId(id);
          if (user) {
            await updateUserAvatar(user.id, id, accessToken);
            setImageSuccessMessage("Imagen de perfil actualizada exitosamente");
            setTimeout(() => {
              setImageSuccessMessage(null);
            }, 5000);
          }
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        let errorMessage = "Error al subir la imagen";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        showTemporaryMessage(null, errorMessage);
      } finally {
        setIsUploading(false);
      }
    };

    uploadAvatar();
  }, [croppedImageUrl, accessToken, user, isUploading]);

  const updateUserAvatar = async (
    userId: string,
    avatarId: string,
    token: string
  ) => {
    try {
      const response = await fetch(`/webapi/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: avatarId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user avatar: ${response.statusText}`);
      }

      if (user) {
        setUser({ ...user, avatar: avatarId });
      }
    } catch (error) {
      console.error("Error updating user avatar:", error);
      throw error;
    }
  };

  const handleProfileUpdate = async (
    values: z.infer<typeof updatedFormSchema>
  ): Promise<void> => {
    setUser((prev) => ({ ...prev, ...values } as User));
    const passwordChanged = Boolean(
      values.password && values.password.trim() !== ""
    );

    try {
      const dataToSubmit: Partial<UpdateUserCredentials> = { ...values };
      delete dataToSubmit.email;
      delete dataToSubmit.birthDate;
      if (!passwordChanged) delete dataToSubmit.password;

      await updateService.updateUser(
        values.id,
        dataToSubmit as UpdateUserCredentials
      );

      if (passwordChanged) {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          router.push("/login");
          return;
        }

        await logoutUser(refreshToken);
        showTemporaryMessage(
          "Tu contraseña ha sido actualizada. Por favor, inicia sesión nuevamente.",
          null
        );

        setTimeout(() => {
          router.push("/login");
        }, 4000);
      } else {
        localStorage.setItem(
          "nombre",
          values.first_name + " " + values.last_name
        );
        window.dispatchEvent(new Event("storage"));
        showTemporaryMessage("Perfil actualizado exitosamente", null);
      }
    } catch (error: unknown) {
      console.error("Error during form submission:", error);

      let errorMessage = "Ocurrió un error inesperado.";
      if (error instanceof Error) errorMessage = error.message;
      showTemporaryMessage(null, errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="container min-h-screen mx-auto py-10 flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando su perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-16 px-4">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        {/* Profile Image Section */}
        <div className="bg-white">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Actualizar imagen de perfil
          </h2>
          <div className="max-w-xs mx-auto">
            <ProfileImageUploader
              onImageCropped={handleCroppedImage}
              existingAvatarId={avatarId || undefined}
            />
            {isUploading && (
              <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded text-sm text-center">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Subiendo imagen de perfil...
              </div>
            )}
            {imageSuccessMessage && (
              <div className="mt-2 text-green-600 text-sm text-center">
                {imageSuccessMessage}
              </div>
            )}
          </div>
        </div>

        {/* Profile Update Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Actualizar Usuario</h2>
          <UpdateUserForm
            onSubmit={handleProfileUpdate}
            initialValues={user || undefined}
            formSchema={updatedFormSchema}
          />

          {error && (
            <div
              className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
              role="alert"
            >
              <p className="font-bold">¡Error!</p>
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div
              className="mt-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded"
              role="alert"
            >
              <p className="font-bold">¡Éxito!</p>
              <p>{successMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
