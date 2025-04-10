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

import { logoutUser } from "@/services/LogoutService"

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
  birthDate: z.string(), // Removed min length validation
  email: z.string(), // Removed email validation
  phone: z.string().min(2, {
    message: "El Telefono debe tener al menos 2 caracteres.",
  }),
  emergencyPhone: z.string().min(0, {
    message: "El Telefono debe tener al menos 2 caracteres.",
  }),
  address: z.string().min(2, {
    message: "El domicilio debe tener al menos 2 caracteres.",
  }),
  password: z.string().optional(),
});

export default function CombinedProfilePage() {
  const router = useRouter();

  // Common state between both pages
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Image upload states (from profile/page.tsx)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const processedImages = useRef(new Set<string>());

  // User update states (from mi-perfil/page.tsx)
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [messageTimer, setMessageTimer] = useState<NodeJS.Timeout | null>(null);

  // Auth check and get user data (combined from both pages)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Redirect to login if no token found
      router.push("/login");
      return;
    }

    setAccessToken(token);

    // Fetch current user information
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);

        // If user already has an avatar, set it
        if (userData.avatar) {
          setAvatarId(userData.avatar);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

        let errorMessage = "Error inesperado";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        // Set the error state using temporary message
        showTemporaryMessage(null, errorMessage);

        // If authentication error, redirect to login
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

  // Function to show temporary messages
  const showTemporaryMessage = (
    successMsg: string | null,
    errorMsg: string | null,
    duration: number = 10000
  ): void => {
    // Clear any existing timer
    if (messageTimer) {
      clearTimeout(messageTimer);
    }

    // Set the messages
    setSuccessMessage(successMsg);
    setError(errorMsg);

    // Set a new timer to clear messages
    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, duration);

    setMessageTimer(timer);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (messageTimer) {
        clearTimeout(messageTimer);
      }
    };
  }, [messageTimer]);

  // Handle cropped image from ProfileImageUploader
  const handleCroppedImage = (image: string) => {
    setCroppedImageUrl(image);
  };

  // Upload avatar when cropped image is available
  useEffect(() => {
    if (!croppedImageUrl || !accessToken || isUploading) {
      return;
    }

    // Skip if we've already processed this image
    if (processedImages.current.has(croppedImageUrl)) {
      return;
    }

    // Mark as uploading and add to processed images
    setIsUploading(true);
    processedImages.current.add(croppedImageUrl);

    const uploadAvatar = async () => {
      try {
        const id = await uploadBase64ToDirectus(croppedImageUrl, accessToken);

        if (id) {
          setAvatarId(id);

          // Update user avatar in Directus
          if (user) {
            await updateUserAvatar(user.id, id, accessToken);
            showTemporaryMessage(
              "Imagen de perfil actualizada exitosamente",
              null
            );
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
        // Reset uploading state but keep the URL to prevent re-upload attempts
        setIsUploading(false);
      }
    };

    uploadAvatar();
  }, [croppedImageUrl, accessToken, user, isUploading]);

  // Function to update user's avatar in the database
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
        body: JSON.stringify({
          avatar: avatarId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user avatar: ${response.statusText}`);
      }

      // Update local user state
      if (user) {
        setUser({ ...user, avatar: avatarId });
      }
    } catch (error) {
      console.error("Error updating user avatar:", error);
      throw error;
    }
  };

  // Handle user profile update form submission
  const handleProfileUpdate = async (
    values: z.infer<typeof updatedFormSchema>
  ): Promise<void> => {
    setUser((prev) => ({ ...prev, ...values } as User));

    // Check if password is changed (not empty)
    const passwordChanged = Boolean(
      values.password && values.password.trim() !== ""
    );

    try {
      // Create a copy of the values object for API submission
      const dataToSubmit: Partial<UpdateUserCredentials> = { ...values };

      // Remove email and birthDate from the update submission
      delete dataToSubmit.email;
      delete dataToSubmit.birthDate;

      // Only include password in the request if it's not empty
      if (!passwordChanged) {
        delete dataToSubmit.password;
      }

      // Send the update request
      await updateService.updateUser(
        values.id,
        dataToSubmit as UpdateUserCredentials
      );

      // If password was changed, log out the user
      if (passwordChanged) {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!refreshToken) {
          console.error("No se encontró el token de refresco")
          router.push("/login");
          return
        }

        // Llama al servicio de logout
        await logoutUser(refreshToken);

        // Show a success message
        showTemporaryMessage(
          "Tu contraseña ha sido actualizada. Por favor, inicia sesión nuevamente.",
          null
        );

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 4000);
      } else {
        // Store the updated name in localStorage
        localStorage.setItem(
          "nombre",
          values.first_name + " " + values.last_name
        );

        // Trigger the storage event for the header to update
        window.dispatchEvent(new Event("storage"));

        // Show success message that disappears after 10 seconds
        showTemporaryMessage("Perfil actualizado exitosamente", null);
      }
    } catch (error: unknown) {
      console.error("Error during form submission:", error);

      let errorMessage = "Ocurrió un error inesperado.";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error message:", errorMessage);
      }

      // Set the error state with our temporary message function
      showTemporaryMessage(null, errorMessage);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando su perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Notification messages */}
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded max-w-3xl mx-auto"
          role="alert"
        >
          <p className="font-bold">¡Error!</p>
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded max-w-3xl mx-auto"
          role="alert"
        >
          <p className="font-bold">¡Éxito!</p>
          <p>{successMessage}</p>
        </div>
      )}

      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        {/* Profile Image Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Actualizar imagen de perfil
          </h2>
          <div className="max-w-xs mx-auto">
            <ProfileImageUploader
              onImageCropped={handleCroppedImage}
              existingAvatarId={avatarId || undefined}
            />
          </div>
          <p className="mt-2 text-center text-gray-600">
            Haz clic en la imagen del perfil o en el botón de carga para
            seleccionar y recortar su imagen de perfil.
          </p>

          {isUploading && (
            <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded text-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Subiendo su imagen de perfil...
            </div>
          )}
        </div>
        {/* Profile Update Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Actualizar Usuario</h2>
          <UpdateUserForm
            onSubmit={handleProfileUpdate}
            initialValues={user || undefined}
            formSchema={updatedFormSchema}
          />
        </div>
      </div>
    </div>
  );
}
