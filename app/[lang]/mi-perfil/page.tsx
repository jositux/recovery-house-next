"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Import the new ProfileImageSection component
import { ProfileImageSection } from "@/components/profile/ProfileImageSection";

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

  const [avatarId, setAvatarId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
        const nombre = ((values.first_name || '') + ' ' + (values.last_name || '')).trim();
        localStorage.setItem("nombre", nombre);
        document.cookie = `nombre=${encodeURIComponent(nombre)}; path=/; max-age=${60*60*24*7}` //7 days
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
        {/* Profile Image Section - Using our new reusable component */}
        {user && accessToken && (
          <ProfileImageSection 
            userId={user.id} 
            accessToken={accessToken}
            existingAvatarId={avatarId}
          />
        )}

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
