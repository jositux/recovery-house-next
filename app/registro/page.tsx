"use client";

import { useState } from "react"; // Removed useEffect
import { motion } from "framer-motion"; // Removed AnimatePresence
// Removed Button import
import SimpleRegisterForm, { formSchema } from "@/components/forms/SimpleRegisterForm"; // Changed import
// Removed LoginForm import
import { Fraunces } from "next/font/google";
import Image from "next/image";

const fraunces = Fraunces({ subsets: ["latin"] });

import { z } from "zod";

import {
  simpleRegisterService,
  RegisterCredentials,
} from "@/services/registerService";

// Removed RegistrationStep type
// Updated RegistrationData type to use the new formSchema
type RegistrationData = z.infer<typeof formSchema>;

export default function RegistrationPage() {
  // Removed currentStep and registrationData state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false); // Added state for verification message

  // Removed useEffect hooks related to steps and registrationData

  // Rewritten handleRegisterSubmit
  const handleRegisterSubmit = async (values: RegistrationData) => {
    setSuccessMessage(null); // Clear previous messages
    setShowVerificationMessage(false);

    try {
      // Construct payload with defaults for missing fields
      const registerData: RegisterCredentials = {
        first_name: "", // Default value
        last_name: "", // Default value
        birthDate: "", // Default value - Consider if API requires a specific format or allows empty
        phone: "", // Default value
        emergencyPhone: "", // Default value
        address: "", // Default value
        email: values.email, // From form
        password: values.password, // From form
        initialRole: "Patient", // Default role
        verification_url: "https://recoverycaresolutions.com/user/verify", // Keep verification URL
      };

      const response = await simpleRegisterService.register(registerData);

      console.log("respuesta ", response.code);

      if (response.code == "409") {
        setSuccessMessage(
          "El email ya está siendo utilizado por otro usuario, por favor use otro"
        );
      } else {
        setShowVerificationMessage(true); // Show verification message instead of changing step
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setSuccessMessage(
        `${error}`
      );
      if (error instanceof Error) {
        // Optionally log more details
      }
    }
  };

  // Removed handleBack and handleTermsAccept

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-16 px-4">
        {/* Removed AnimatePresence and motion.div wrapper for title */}

        {!showVerificationMessage ? (
          <>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h1 className={`${fraunces.className} text-2xl sm:mx-auto font-medium mb-6`}>
            Registrate en RecoverCare Solutions
            </h1>
            </div>
            {/* Use SimpleRegisterForm */}
            <div className="sm:mx-auto p-8 sm:w-full sm:max-w-md bg-white bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <SimpleRegisterForm
              onSubmit={handleRegisterSubmit}
              // Removed initialValues as they are not relevant for simple form state
            />
            </div>
          </>
        ) : (
          // Display verification message directly
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4 p-8 bg-white rounded-xl">
              <h1
                className={`${fraunces.className} text-2xl text-center font-medium mb-6`}
              >
                ¡Bienvenido! {/* Simplified welcome message */}
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

        {/* Removed terms, login steps */}

        {/* Keep success/error message display */}
        {successMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 mb-4 rounded" role="alert">
            <p className="font-bold">¡Atención!</p>
            <p>{successMessage}</p>
          </div>
        )}
        {/* Removed AnimatePresence closing tag */}
      </div>
    </div>
  );
}