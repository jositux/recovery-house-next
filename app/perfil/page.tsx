"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
// Import the new form and schema
import ComplementaryRegisterForm, {
  complementaryFormSchema,
} from "@/components/forms/ComplementaryRegisterForm";
// Import the ProfileImageSection component
import { ProfileImageSection } from "@/components/profile/ProfileImageSection";
// Import getCurrentUser from userService
import { getCurrentUser, type User } from "@/services/userService";
// Removed LoginForm import
import { Fraunces } from "next/font/google";
import Image from "next/image";

const fraunces = Fraunces({ subsets: ["latin"] });

//import { VerificationCodeInput } from "@/components/ui/verification-code-input"
import { z } from "zod";

// Import the new service and credentials type
import {
  complementaryRegisterService,
  ComplementaryRegisterCredentials,
} from "@/services/complementaryRegisterService";
import { useRouter } from "next/navigation";
// Removed verification service import

// Updated registration steps - removed verification and login
type RegistrationStep = "details" | "terms" | "success";

// Updated registration data type
type RegistrationData = z.infer<typeof complementaryFormSchema>;

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("details");
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null);

  // Changed successMessage state to reflect completion
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null
  );

  const router = useRouter();

  // States for user data and token
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setAccessToken(token);
    setIsLoading(true);

    // Fetch the current user data using the imported service
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

  useEffect(() => {
    if (currentStep === "terms") {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [currentStep]);

  // Updated function signature
  const handleRegisterSubmit = (
    values: z.infer<typeof complementaryFormSchema>
  ) => {
    setRegistrationData(values); // Actualizar datos de registro
  };

  useEffect(() => {
    // Verificar si registrationData ha sido actualizado
    if (registrationData) {
      // Solo ejecutar handleTermsAccept si registrationData ya está disponible
      handleTermsAccept();
    }
  }, [registrationData]); // Este useEffect se ejecuta cuando registrationData cambia

  // Create initial values based on user data or fallback to registrationData
  const getInitialValues = () => {
    // If user data exists, use it for the specified fields
    if (user) {
      return {
        // Use user data for the specified fields
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        address: user.address || "",
        phone: user.phone || "",
        emergencyPhone: user.emergencyPhone || "",
        // Keep other fields from registrationData if they exist
        ...(registrationData && {
          birthDate: registrationData.birthDate || "",
          initialRole: registrationData.initialRole || "Patient",
        }),
      };
    }

    // Otherwise, use existing registrationData or undefined
    return registrationData || undefined;
  };

  const handleTermsAccept = async () => {
    if (!registrationData) {
      return;
    }

    // Clear previous completion message
    setCompletionMessage(null);

    // Check for session and access token
    const token = localStorage.getItem("access_token");
    if (!token) {
      setCompletionMessage(
        "Error: No se pudo obtener la información del usuario. Por favor, inicia sesión de nuevo."
      );
      console.error("Session or access token missing");
      return;
    }

    try {
      // Use credentials type
      const updateData: ComplementaryRegisterCredentials = {
        first_name: registrationData.first_name,
        last_name: registrationData.last_name,
        birthDate: registrationData.birthDate,
        phone: registrationData.phone,
        emergencyPhone: registrationData.emergencyPhone,
        address: registrationData.address,
        initialRole: registrationData.initialRole,
      };

      // Call the updated service function with credentials and access token
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
      console.log(nombre);
      localStorage.setItem("nombre", nombre);
      document.cookie = `nombre=${encodeURIComponent(
        nombre
      )}; path=/; max-age=${60 * 60 * 24 * 7}`; //7 days

      window.dispatchEvent(new Event("storage"));

      // Set success message and move to success step
      setCompletionMessage("¡Información actualizada con éxito!");
      setCurrentStep("success");
    } catch (error) {
      // Set a generic error message from the service or a default one
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar la información. Por favor, inténtalo de nuevo.";
      setCompletionMessage(errorMessage);
      console.error("User update error:", error); // Log the error
    }
  };

  const handleBack = () => {
    console.log(registrationData?.birthDate);
    setCurrentStep("details");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
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
              {/* Profile Image Section */}
              {user && accessToken && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <ProfileImageSection
                    userId={user.id}
                    accessToken={accessToken}
                    existingAvatarId={user.avatar}
                  />
                </div>
              )}
              <h2
                className={`${fraunces.className} text-xl font-medium mb-6`}
              ></h2>

              {/* Display loading state or form when ready */}
              {isLoading ? (
                <div className="flex justify-center items-center p-10 bg-white rounded-lg">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#39759E]"></div>
                </div>
              ) : (
                <ComplementaryRegisterForm
                  onSubmit={handleRegisterSubmit}
                  initialValues={getInitialValues()}
                />
              )}
            </motion.div>
          )}

          {currentStep === "terms" && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold mb-6">
                Recovery Care Solutions es una plataforma a la que cualquiera
                puede pertenecer
              </h1>
              <p className="mb-8 text-[#162F40]">
                Para garantizar esto, le pedimos que se comprometa a lo
                siguiente: Acepto tratar a todos los miembros de la comunidad
                independientemente de su raza, religión, origen nacional, etnia,
                color de piel, discapacidad, sexo, identidad de género,
                orientación sexual o edad, con respeto y sin juicios ni
                prejuicios.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-[#39759E] hover:text-[#39759E] hover:bg-[#39759E]/10"
                >
                  VOLVER
                </Button>
                <Button
                  onClick={handleTermsAccept}
                  className="flex-1 bg-[#39759E] hover:bg-[#39759E]"
                >
                  DE ACUERDO Y CONTINÚO
                </Button>
              </div>
            </motion.div>
          )}

          {/* Removed verification and login steps */}
          {/* Added success step */}
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
                <div className="flex justify-center">
                  <Image
                    src="/assets/logo2.svg"
                    alt="Recovery Care Solutions"
                    width={180}
                    height={80}
                  />
                </div>
                {/* Optionally add a button to navigate away */}
                {/* <Button onClick={() => router.push('/dashboard')} className="mt-6 bg-[#39759E] hover:bg-[#39759E]">
                  Ir al Panel
                </Button> */}
              </div>
            </motion.div>
          )}

          {/* Display completion message (could be success or error) */}
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
