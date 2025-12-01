"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, useParams } from "next/navigation"; // ✅ Añadido useParams
import { Fraunces } from "next/font/google";
import Image from "next/image";
import type { z } from "zod";

// Import components
// DESPUÉS (Usa el esquema base estático):
import PerfilRegisterForm, {
   complementaryFormSchemaBase, // 👈 Si necesitas el objeto esquema estático
} from "@/components/forms/PerfilRegisterForm";

import { ProfileImageSection } from "@/components/profile/ProfileImageSection";
import { getCurrentUser, type User } from "@/services/userService";
import {
  complementaryRegisterService,
  type ComplementaryRegisterCredentials,
} from "@/services/complementaryRegisterService";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

// Definición simple de tipos de idioma para referencia (Asegúrate de que esta importación exista)
import { type Locale } from "@/lib/i18n"; 

const fraunces = Fraunces({ subsets: ["latin"] });

type RegistrationStep = "details" | "success";
type RegistrationData = z.infer<typeof complementaryFormSchemaBase>;

// 📚 Objeto de Traducciones
const translations = {
  es: {
    title: "Perfil de Usuario",
    subtitle:
      "Completa tu perfil para utilizar la plataforma. Si prefieres hacerlo más adelante, ten en cuenta que se te solicitará esta información en el futuro para poder operar.",
    loading: "Cargando",
    successTitle: "¡Gracias, ",
    successDefault: "Tu información ha sido actualizada.",
    errorAuth: "Error: No se pudo obtener la información del usuario. Por favor, inicia sesión de nuevo.",
    errorUpdate: "Ocurrió un error al actualizar la información. Por favor, inténtalo de nuevo.",
    actionRooms: "Ver habitaciones disponibles",
    actionProperty: "Agregar Propiedad",
    actionService: "Agregar Servicio",
    actionProfile: "Ver mi Perfil",
    actionCheckout: "Seguir con el pago",
    actionReserve: "Seguir con la reserva",
    alertTitleError: "Error",
    alertTitleSuccess: "Éxito",

    // Dialog & Rel messages
    dialogTitle: "Completar Datos de Usuario",
    dialogCancel: "Cancelar",
    dialogAccept: "Aceptar",
    relProperty:
      "Si desea registrar la propiedad debe completar los datos de usuario obligatoriamente",
    relService:
      "Si desea registrar un servicio debe completar los datos de usuario obligatoriamente",
    relCheckout:
      "Si desea pagar la reserva debe completar los datos de usuario obligatoriamente",
    relProfile:
      "Debe completar los datos de usuario obligatoriamente antes de modificar",
    relDefault:
      "Si desea reservar la habitación debe completar los datos de usuario obligatoriamente",
  },
  en: {
    title: "User Profile",
    subtitle:
      "Complete your profile to use the platform. If you prefer to do it later, please note that this information will be required in the future to operate.",
    loading: "Loading",
    successTitle: "Thank you, ",
    successDefault: "Your information has been updated.",
    errorAuth: "Error: Could not retrieve user information. Please log in again.",
    errorUpdate: "An error occurred while updating the information. Please try again.",
    actionRooms: "View available rooms",
    actionProperty: "Add Property",
    actionService: "Add Service",
    actionProfile: "View my Profile",
    actionCheckout: "Continue with payment",
    actionReserve: "Continue with booking",
    alertTitleError: "Error",
    alertTitleSuccess: "Success",

    // Dialog & Rel messages
    dialogTitle: "Complete User Details",
    dialogCancel: "Cancel",
    dialogAccept: "Accept",
    relProperty:
      "If you wish to register the property, you must complete the user data.",
    relService:
      "If you wish to register a service, you must complete the user data.",
    relCheckout:
      "If you wish to pay for the reservation, you must complete the user data.",
    relProfile:
      "You must complete the user data before modifying.",
    relDefault:
      "If you wish to book the room, you must complete the user data.",
  },
};

export default function RegistrationPage() {
  // 🌐 Lógica de Idioma
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  const texts = translations[lang as keyof typeof translations] || translations.en;

  const [currentStep, setCurrentStep] = useState<RegistrationStep>("details");
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null
  );
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showRelDialog, setShowRelDialog] = useState(false);
  const [relDialogConfig, setRelDialogConfig] = useState<{
    message: string;
    cancelRoute: string;
  } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Función de mapeo de mensajes de diálogo, ahora traducida con useMemo
  const getUserCompletionMessage = useCallback(
    (relParam: string): { message: string; cancelRoute: string } => {
      const routes: Record<string, { message: string; cancelRoute: string }> = {
        "registrar-propiedad": {
          message: texts.relProperty,
          cancelRoute: "/mi-panel/mis-propiedades",
        },
        "registrar-servicio": {
          message: texts.relService,
          cancelRoute: "/mi-panel/mi-servicio",
        },
        checkout: {
          message: texts.relCheckout,
          cancelRoute: "/checkout",
        },
        "mi-perfil": {
          message: texts.relProfile,
          cancelRoute: "/rooms", // Mejor ruta si cancela desde mi-perfil? O un sitio seguro.
        },
      };

      return (
        routes[relParam] || {
          message: texts.relDefault,
          cancelRoute: `/rooms/${relParam}`,
        }
      );
    },
    [texts]
  );
  
  // Función para obtener el texto del botón de acción
  const getActionButtonText = useCallback(() => {
    const relParam = searchParams.get("rel");

    if (!relParam) return texts.actionRooms;

    if (relParam === "registrar-propiedad") return texts.actionProperty;
    if (relParam === "registrar-servicio") return texts.actionService;
    if (relParam === "mi-perfil") return texts.actionProfile;
    if (relParam === "checkout" || relParam.includes("pay"))
      return texts.actionCheckout;

    return texts.actionReserve;
  }, [searchParams, texts]);

  // useEffect para el diálogo de 'rel'
  useEffect(() => {
    const relParam = searchParams.get("rel");

    if (relParam) {
      const { message, cancelRoute } = getUserCompletionMessage(relParam);
      setRelDialogConfig({ message, cancelRoute });
      setShowRelDialog(true);
    }
  }, [searchParams, getUserCompletionMessage]); // Depende de la función traducida

  // useEffect para cargar el usuario (sin cambios)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setAccessToken(token);
    setIsLoading(true);

    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);

        if (error instanceof Error && error.message.includes("Token")) {
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

  const handleRegisterSubmit = (
    values: z.infer<typeof complementaryFormSchemaBase>
  ) => {
    setRegistrationData(values);
  };

  useEffect(() => {
    if (registrationData) {
      handleTermsAccept();
    }
  }, [registrationData]);

  const getInitialValues = () => {
    if (user) {
      return {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        address: user.address || "",
        phone: user.phone || "",
        emergencyPhone: user.emergencyPhone || "",
        ...(registrationData && {
          birthDate: registrationData.birthDate || "",
          initialRole: registrationData.initialRole || "Patient",
        }),
      };
    }

    return registrationData || undefined;
  };

  const handleTermsAccept = async () => {
    if (!registrationData) {
      return;
    }

    setCompletionMessage(null);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setCompletionMessage(texts.errorAuth); // 👈 Traducido
      console.error("Session or access token missing");
      return;
    }

    try {
      const updateData: ComplementaryRegisterCredentials = {
        first_name: registrationData.first_name,
        last_name: registrationData.last_name,
        birthDate: registrationData.birthDate,
        phone: registrationData.phone,
        emergencyPhone: registrationData.emergencyPhone,
        address: registrationData.address,
        initialRole: registrationData.initialRole,
      };

      const updatedUser = await complementaryRegisterService.updateUser(
        updateData,
        token
      );

      localStorage.setItem("initialRole", updateData.initialRole);
      const nombre = (
        (updatedUser.first_name || "") +
        " " +
        (updatedUser.last_name || "")
      ).trim();
      localStorage.setItem("nombre", nombre);
      document.cookie = `nombre=${encodeURIComponent(
        nombre
      )}; path=/; max-age=${60 * 60 * 24 * 7}`;

      window.dispatchEvent(new Event("storage"));

      setCompletionMessage(texts.successDefault); // 👈 Traducido
      setCurrentStep("success");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : texts.errorUpdate; // 👈 Traducido
      setCompletionMessage(errorMessage);
      console.error("User update error:", error);
    }
  };

  const handleDialogAccept = () => {
    setShowRelDialog(false);
  };

  const handleDialogCancel = () => {
    if (relDialogConfig) {
      router.push(relDialogConfig.cancelRoute);
    }
  };

  const handleActionButtonClick = useCallback(() => {
    const relParam = searchParams.get("rel");

    if (!relParam) {
      window.location.href = "/rooms";
      return;
    }

    const routes: Record<string, string> = {
      "registrar-propiedad": "/mi-panel/registrar-propiedad",
      "registrar-servicio": "/mi-panel/registrar-servicio",
      checkout: "/checkout",
      "mi-perfil": "/mi-panel/mi-perfil"
    };

    const targetRoute = routes[relParam] || `/rooms/${relParam}`;
    
    window.location.href = targetRoute;
  }, [searchParams]);

  // 🖼️ RENDERIZADO Y TRADUCCIÓN EN JSX
  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <Dialog open={showRelDialog} onOpenChange={setShowRelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <DialogTitle>{texts.dialogTitle}</DialogTitle> {/* 👈 Traducido */}
            </div>
            <DialogDescription className="text-base pt-2">
              {relDialogConfig?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={handleDialogCancel}
              className="flex-1 bg-transparent"
            >
              {texts.dialogCancel} {/* 👈 Traducido */}
            </Button>
            <Button
              onClick={handleDialogAccept}
              className="flex-1 bg-[#39759E] hover:bg-[#2d5f7f]"
            >
              {texts.dialogAccept} {/* 👈 Traducido */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto max-w-2xl py-16 px-4">
        <AnimatePresence mode="wait">
          {currentStep === "details" && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h1
                  className={`${fraunces.className} text-2xl font-medium mb-6`}
                >
                  {texts.title} {/* 👈 Traducido */}
                </h1>
                <p className="mb-4">
                  {texts.subtitle} {/* 👈 Traducido */}
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {user && accessToken && (
                <div className="p-6 rounded-lg">
                  <ProfileImageSection
                    userId={user.id}
                    accessToken={accessToken}
                    existingAvatarId={user.avatar}
                  />
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center p-10 bg-white rounded-lg">
                  {/* Mensaje de carga */}
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#39759E] mr-3"></div>
                  <span className="text-[#39759E]">{texts.loading}</span> {/* 👈 Traducido */}
                </div>
              ) : (
                <PerfilRegisterForm
                  onSubmit={handleRegisterSubmit}
                  initialValues={getInitialValues()}
                />
              )}
            </motion.div>
          )}

          {currentStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4 p-8 bg-white rounded-xl text-center">
                <h1
                  className={`${fraunces.className} text-2xl font-medium mb-6`}
                >
                  {texts.successTitle}
                  {registrationData?.first_name}!
                </h1>
                <p className="mb-4">
                  {completionMessage || texts.successDefault}
                </p>

                {getActionButtonText() && (
                  <div className="flex justify-center mt-16">
                    <Button
                      onClick={handleActionButtonClick}
                      className="px-16 py-6 text-base font-medium"
                      style={{ backgroundColor: "#39759E" }}
                    >
                      {getActionButtonText()} {/* 👈 Traducido */}
                    </Button>
                  </div>
                )}

                <div className="flex justify-center pt-6">
                  <Image
                    src="/assets/logo2.svg"
                    alt="Recovery Care Solutions"
                    width={180}
                    height={80}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {completionMessage && currentStep !== "success" && (
            <div
              className={`border-l-4 p-4 mt-4 mb-4 rounded ${
                completionMessage.includes("Error") || completionMessage.includes("error")
                  ? "bg-red-100 border-red-500 text-red-700"
                  : "bg-green-100 border-green-500 text-green-700"
              }`}
              role="alert"
            >
              <p className="font-bold">
                {completionMessage.includes("Error") || completionMessage.includes("error") ? texts.alertTitleError : texts.alertTitleSuccess}
              </p>
              <p>{completionMessage}</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}