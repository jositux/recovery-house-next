"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // ✅ Añadido useParams
//import { z } from "zod";
import { Fraunces } from "next/font/google"
import { Loader2 } from 'lucide-react'; // Para el spinner

// Tipos de idioma (asumo que existe este path)
import { type Locale } from "@/lib/i18n"; 

const fraunces = Fraunces({ subsets: ["latin"] })

// Import the new ProfileImageSection component
import { ProfileImageSection } from "@/components/profile/ProfileImageSection";

// User data services
import { getCurrentUser, type User } from "@/services/userService";
import {
  updateService,
  UpdateUserCredentials,
} from "@/services/updateUserService";

// Form component: Importamos el esquema base estático
import UpdateUserForm, { formSchemaBase as UpdateUserFormSchemaBase, type FormFields as UpdateFormValues } from "@/components/forms/UpdateUserForm";

import { logoutUser } from "@/services/LogoutService";

// ===============================================================
// 📚 Objeto de Traducciones
// ===============================================================

type TranslationText = {
  // UI Texts
  pageTitle: string;
  loadingMessage: string;
  formSectionTitle: string;
  
  // Messages
  errorUnexpected: string;
  errorFetchingData: string;
  errorToken: string;
  successPasswordChange: string;
  successProfileUpdate: string;

  // Alerts
  alertErrorTitle: string;
  alertSuccessTitle: string;
};

const translations: Record<string, TranslationText> = {
  es: {
    pageTitle: "Mi perfil",
    loadingMessage: "Cargando su perfil...",
    formSectionTitle: "Actualizar Usuario",
    
    errorUnexpected: "Ocurrió un error inesperado.",
    errorFetchingData: "Error al obtener los datos del usuario.", // Mensaje más específico para la carga
    errorToken: "Error de sesión. Será redirigido al login.",
    successPasswordChange:
      "Tu contraseña ha sido actualizada. Por favor, inicia sesión nuevamente.",
    successProfileUpdate: "Perfil actualizado exitosamente",

    alertErrorTitle: "¡Error!",
    alertSuccessTitle: "¡Éxito!",
  },
  en: {
    pageTitle: "My Profile",
    loadingMessage: "Loading your profile...",
    formSectionTitle: "Update User",
    
    errorUnexpected: "An unexpected error occurred.",
    errorFetchingData: "Error fetching user data.",
    errorToken: "Session error. You will be redirected to the login.",
    successPasswordChange:
      "Your password has been updated. Please log in again.",
    successProfileUpdate: "Profile updated successfully",

    alertErrorTitle: "Error!",
    alertSuccessTitle: "Success!",
  },
};


// NOTA: El esquema Zod local `updatedFormSchema` ya no es necesario 
// porque importamos el tipo directamente del componente hijo.
/*
const updatedFormSchema = z.object({ ... });
*/


export default function CombinedProfilePage() {
  const router = useRouter();
  
  // 🌐 Lógica de Idioma
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  const texts = translations[lang as keyof typeof translations] || translations.en;

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

        let errorMessage = texts.errorFetchingData; // 👈 Traducido
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        showTemporaryMessage(null, errorMessage);

        if (errorMessage.includes("Token")) {
          showTemporaryMessage(null, texts.errorToken); // 👈 Traducido
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, texts]); // Dependencia de 'texts' para mensajes de error de carga

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
    values: UpdateFormValues // ✅ Usando el tipo inferido del esquema base exportado
  ): Promise<void> => {
    setUser((prev) => ({ ...prev, ...values } as User));
    const passwordChanged = Boolean(
      values.password && values.password.trim() !== ""
    );

    try {
      const dataToSubmit: Partial<UpdateUserCredentials> = { ...values };
      // Eliminar campos que no deben enviarse en la actualización
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
          texts.successPasswordChange, // 👈 Traducido
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
        
        showTemporaryMessage(texts.successProfileUpdate, null); // 👈 Traducido
      }
    } catch (error: unknown) {
      console.error("Error during form submission:", error);

      let errorMessage = texts.errorUnexpected; // 👈 Traducido
      if (error instanceof Error) errorMessage = error.message;
      showTemporaryMessage(null, errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="container min-h-screen mx-auto py-10 flex justify-center items-center h-[60vh]">
        <div className="text-center">
          {/* Usamos el spinner de Loader2 */}
          <Loader2 className="w-8 h-8 border-4 text-[#39759E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">{texts.loadingMessage}</p> {/* 👈 Traducido */}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-4">
      <h1 className={`${fraunces.className} text-3xl font-normal text-center text-[#162F40] mb-8`}>
                   {texts.pageTitle} {/* 👈 Traducido */}
              </h1>
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      
        {/* Profile Image Section */}
        {user && accessToken && (
          <ProfileImageSection 
            userId={user.id} 
            accessToken={accessToken}
            existingAvatarId={avatarId}
          />
        )}

        {/* Profile Update Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{texts.formSectionTitle}</h2> {/* 👈 Traducido */}
          <UpdateUserForm
            onSubmit={handleProfileUpdate}
            initialValues={user || undefined}
            // Pasamos el esquema BASE importado si queremos asegurarnos de usar el estático
            formSchema={UpdateUserFormSchemaBase} 
          />

          {error && (
            <div
              className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
              role="alert"
            >
              <p className="font-bold">{texts.alertErrorTitle}</p> {/* 👈 Traducido */}
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div
              className="mt-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded"
              role="alert"
            >
              <p className="font-bold">{texts.alertSuccessTitle}</p> {/* 👈 Traducido */}
              <p>{successMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}