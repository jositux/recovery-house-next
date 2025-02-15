"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import RegisterForm, { formSchema } from "@/components/forms/RegisterForm";
import { LoginForm } from "@/components/forms/LoginForm";
import { Fraunces } from "next/font/google";
import Image from "next/image";

const fraunces = Fraunces({ subsets: ["latin"] });

//import { VerificationCodeInput } from "@/components/ui/verification-code-input"
import { z } from "zod";

import {
  registerService,
  RegisterCredentials,
} from "@/services/registerService";
//import { verificationService, VerificationCredentials } from "@/services/verificationService"; // Import verification service

type RegistrationStep = "details" | "terms" | "verification" | "login";

type RegistrationData = z.infer<typeof formSchema>;

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("details");
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null);
  //const [verificationError, setVerificationError] = useState<string | null>(null); // Added verification error state

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

  const handleRegisterSubmit = (values: z.infer<typeof formSchema>) => {
    setRegistrationData(values); // Actualizar datos de registro
  };

  useEffect(() => {
    // Verificar si registrationData ha sido actualizado
    if (registrationData) {
      // Solo ejecutar handleTermsAccept si registrationData ya está disponible
      handleTermsAccept();
    }
  }, [registrationData]); // Este useEffect se ejecuta cuando registrationData cambia

  const handleTermsAccept = async () => {
    if (!registrationData) {
      return;
    }

    try {
      const registerData: RegisterCredentials = {
        first_name: registrationData.first_name,
        last_name: registrationData.last_name,
        birthDate: registrationData.birthDate,
        phone: registrationData.phone,
        emergencyPhone: registrationData.emergencyPhone,
        address: registrationData.address,
        email: registrationData.email,
        password: registrationData.password,
        initialRole: registrationData.initialRole,
        verification_url: "https://recoverycaresolutions.com/user/verify",
      };
      const response = await registerService.register(registerData);

      

      localStorage.setItem("initialRole", registerData.initialRole);

      if (response.challenge) {
        localStorage.setItem("initialRole", registerData.initialRole);
        localStorage.setItem("verificationChallenge", response.challenge);
      }

      setCurrentStep("verification");
    } catch (error) {
      if (error instanceof Error) {
      }
    }
  };

  const handleBack = () => {
    console.log(registrationData?.birthDate);
    setCurrentStep("details");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-10 px-4">
        <h1 className={`${fraunces.className} text-2xl font-medium mb-6`}>
          Registrar Usuario
        </h1>

        <AnimatePresence mode="wait">
          {currentStep === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm
                onSubmit={handleRegisterSubmit}
                initialValues={registrationData || undefined}
              />
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

          {currentStep === "verification" && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4 p-8 bg-white rounded-xl">
                <h1
                  className={`${fraunces.className} text-2xl text-center font-medium mb-6`}
                >
                  Bienvenido, {registrationData?.first_name}
                </h1>
                <p className="mb-4">
                  Se ha enviado un email para activar esta cuenta, por favor
                  revisa tu bandeja de entrada y sigue las instrucciones para
                  completar el proceso de activación de tu cuenta.
                </p>

                <div className="flex justify-center">
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

          {currentStep === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold mb-6">
                Bienvenido, {registrationData?.first_name}
              </h1>
              <p className="mb-4">Por favor, inicia sesión para continuar.</p>
              <LoginForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
