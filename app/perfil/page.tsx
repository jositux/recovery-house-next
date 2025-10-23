"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Fraunces } from "next/font/google";
import Image from "next/image";
import type { z } from "zod";

// Import components
import PerfilRegisterForm, {
  type complementaryFormSchema,
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

const fraunces = Fraunces({ subsets: ["latin"] });

type RegistrationStep = "details" | "success";
type RegistrationData = z.infer<typeof complementaryFormSchema>;

export default function RegistrationPage() {
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

  useEffect(() => {
    const relParam = searchParams.get("rel");

    if (relParam) {
      // Definimos el tipo de las claves que puede tener "relParam"
      type RelParamType =
        | "registrar-propiedad"
        | "registrar-servicio"
        | "checkout"
        | string;

      interface RelDialogConfig {
        message: string;
        cancelRoute: string;
      }

      const getUserCompletionMessage = (
        relParam: RelParamType
      ): RelDialogConfig => {
        const routes: Record<string, RelDialogConfig> = {
          "registrar-propiedad": {
            message:
              "Si desea registrar la propiedad debe completar los datos de usuario obligatoriamente",
            cancelRoute: "/mi-panel/mis-propiedades",
          },
          "registrar-servicio": {
            message:
              "Si desea registrar un servicio debe completar los datos de usuario obligatoriamente",
            cancelRoute: "/mi-panel/mi-servicio",
          },
          checkout: {
            message:
              "Si desea pagar la reserva debe completar los datos de usuario obligatoriamente",
            cancelRoute: "/checkout",
          },
          "mi-perfil": {
            message:
              "Debe completar los datos de usuario obligatoriamente antes de modificar",
            cancelRoute: "/rooms",
          },
        };

        return (
          routes[relParam] || {
            message:
              "Si desea reservar la habitación debe completar los datos de usuario obligatoriamente",
            cancelRoute: `/rooms/${relParam}`,
          }
        );
      };

      const { message, cancelRoute } = getUserCompletionMessage(relParam);
      setRelDialogConfig({ message, cancelRoute });
      setShowRelDialog(true);
    }
  }, [searchParams]);

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
    values: z.infer<typeof complementaryFormSchema>
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
      setCompletionMessage(
        "Error: No se pudo obtener la información del usuario. Por favor, inicia sesión de nuevo."
      );
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

      setCompletionMessage("¡Información actualizada con éxito!");
      setCurrentStep("success");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar la información. Por favor, inténtalo de nuevo.";
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

  const getActionButtonText = () => {
    const relParam = searchParams.get("rel");

    if (!relParam) return "Ver habitaciones disponible";

    if (relParam === "registrar-propiedad") return "Agregar Propiedad";
    if (relParam === "registrar-servicio") return "Agregar Servicio";
    if (relParam === "mi-perfil") return "Ver mi Perfil";
    if (relParam === "checkout" || relParam.includes("pay"))
      return "Seguir con el pago";

    return "Seguir con la reserva";
  };

  const handleActionButtonClick = () => {
    const relParam = searchParams.get("rel");

    // Si no hay parámetro, redirige por defecto a /rooms
    if (!relParam) {
      router.push("/rooms");
      return;
    }

    const routes: Record<string, string> = {
      "registrar-propiedad": "/mi-panel/registrar-propiedad",
      "registrar-servicio": "/mi-panel/registrar-servicio",
      checkout: "/checkout",
      "mi-perfil": "/mi-panel/mi-perfil",
    };

    // Usa la ruta definida o una dinámica según el parámetro
    const targetRoute = routes[relParam] || `/rooms/${relParam}`;
    router.push(targetRoute);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <Dialog open={showRelDialog} onOpenChange={setShowRelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <DialogTitle>Completar Datos de Usuario</DialogTitle>
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
              Cancelar
            </Button>
            <Button
              onClick={handleDialogAccept}
              className="flex-1 bg-[#39759E] hover:bg-[#2d5f7f]"
            >
              Aceptar
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
                  Perfil de Usuario
                </h1>
                <p className="mb-4">
                  Completa tu perfil para utilizar la plataforma. Si prefieres
                  hacerlo más adelante, ten en cuenta que se te solicitará esta
                  información en el futuro para poder operar.
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
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#39759E]"></div>
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
                  ¡Gracias, {registrationData?.first_name}!
                </h1>
                <p className="mb-4">
                  {completionMessage || "Tu información ha sido actualizada."}
                </p>

                {getActionButtonText() && (
                  <div className="flex justify-center mt-16">
                    <Button
                      onClick={handleActionButtonClick}
                      className="px-16 py-6 text-base font-medium"
                      style={{ backgroundColor: "#39759E" }}
                    >
                      {getActionButtonText()}
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
                completionMessage.includes("error")
                  ? "bg-red-100 border-red-500 text-red-700"
                  : "bg-green-100 border-green-500 text-green-700"
              }`}
              role="alert"
            >
              <p className="font-bold">
                {completionMessage.includes("error") ? "Error" : "Éxito"}
              </p>
              <p>{completionMessage}</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
