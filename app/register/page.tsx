"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import RegisterForm, { formSchema } from "@/components/forms/RegisterForm"
import { LoginForm } from "@/components/forms/LoginForm"
//import { VerificationCodeInput } from "@/components/ui/verification-code-input"
import { z } from "zod"

import { registerService, RegisterCredentials } from "@/services/registerService"
//import { verificationService, VerificationCredentials } from "@/services/verificationService"; // Import verification service

type RegistrationStep = 'details' | 'terms' | 'verification' | 'login'

type RegistrationData = z.infer<typeof formSchema>;

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('details')
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  //const [verificationError, setVerificationError] = useState<string | null>(null); // Added verification error state

  useEffect(() => {
    if (currentStep === 'terms') {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [currentStep]);

  const handleRegisterSubmit = (values: z.infer<typeof formSchema>) => {
    setRegistrationData(values)
    setCurrentStep('terms')
  }

  const handleTermsAccept = async () => {
    if (!registrationData) {
     
      return
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
        verification_url: "https://recovery-care.vercel.app/user/verify"
      };
      const response = await registerService.register(registerData);
      if (response.challenge) {
        localStorage.setItem('verificationChallenge', response.challenge);
      }
   
      setCurrentStep('verification')
    } catch (error) {
      if (error instanceof Error) {
       
      }
    }
  }

  /*const handleVerificationComplete = async (code: string) => {
    const storedChallenge = localStorage.getItem('verificationChallenge');
    if (!storedChallenge || !registrationData) {
      setVerificationError("No se pudo completar la verificación. Por favor, intenta registrarte de nuevo.");
      return;
    }

    try {
      const verificationData: VerificationCredentials = {
        eMail: registrationData.email,
        code: parseInt(code, 10),
        challenge: storedChallenge,
      };
      await verificationService.verify(verificationData);
      localStorage.removeItem('verificationChallenge');
     
      setCurrentStep('login');
    } catch (error) {
      if (error instanceof Error) {
        setVerificationError(error.message);
      } else {
        setVerificationError("Ocurrió un error durante la verificación. Por favor, intenta de nuevo.");
      }
    }
  }*/

  /*const handleResendCode = () => {
   
  }*/

  const handleBack = () => {
    setCurrentStep('details')
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-md py-10">
        <AnimatePresence mode="wait">
          {currentStep === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold mb-6">Registro</h1>
              <RegisterForm onSubmit={handleRegisterSubmit} initialValues={registrationData || undefined} />
            </motion.div>
          )}

          {currentStep === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold mb-6">Recovery Care Solutions es una plataforma a la que cualquiera puede pertenecer</h1>
              <p className="mb-8 text-gray-600">
                Para garantizar esto, le pedimos que se comprometa a lo siguiente: Acepto tratar a todos los miembros de la comunidad independientemente de su raza, religión, origen nacional, etnia, color de piel, discapacidad, sexo, identidad de género, orientación sexual o edad, con respeto y sin juicios ni prejuicios.
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="text-[#4A7598] hover:text-[#3A5F7A] hover:bg-[#4A7598]/10"
                >
                  VOLVER
                </Button>
                <Button 
                  onClick={handleTermsAccept} 
                  className="flex-1 bg-[#4A7598] hover:bg-[#3A5F7A]"
                >
                  DE ACUERDO Y CONTINÚO
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
               <h1 className="text-2xl font-bold mb-6">Bienvenido, {registrationData?.first_name}</h1>
              <p className="mb-4">Se ha enviado un email para activar esta cuenta, por favor revisa tu bandeja de entrada y sigue las instrucciones para completar el proceso de activación de tu cuenta.</p>
              {/*<h1 className="text-2xl font-bold mb-6">Verificación</h1>
              <p className="mb-4">Por favor, ingresa el código de verificación enviado a tu email.</p>
              <VerificationCodeInput 
                onComplete={handleVerificationComplete} 
                email={registrationData?.email ?? ''}
                onResend={handleResendCode}
              />
              {verificationError && (
                <p className="mt-4 text-red-500">{verificationError}</p>
              )}*/}
            </motion.div>
          )}

          {currentStep === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold mb-6">Bienvenido, {registrationData?.first_name}</h1>
              <p className="mb-4">Por favor, inicia sesión para continuar.</p>
              <LoginForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

