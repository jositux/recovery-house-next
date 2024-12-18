"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PropertyBaseForm, PropertyBaseFormValues } from "@/components/forms/PropertyBaseForm"
import { AmenitiesForm, AmenitiesFormValues } from "@/components/forms/AmenitiesForm"
import { RoomConfigurationForm, RoomConfigurationFormValues } from "@/components/forms/RoomConfigurationForm"


type RegistrationStep = 'base' | 'amenities' | 'rooms'

type FormData = {
  base?: PropertyBaseFormValues,
  amenities?: AmenitiesFormValues,
  rooms?: RoomConfigurationFormValues
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

export default function RegisterPropertyPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('base')
  const [formData, setFormData] = useState<FormData>({})

  useEffect(() => {
    if (currentStep !== 'base') {
      scrollToTop();
    }
  }, [currentStep]);

  const handleNext = (step: RegistrationStep, data: PropertyBaseFormValues | AmenitiesFormValues | RoomConfigurationFormValues) => {
    setFormData(prev => ({ ...prev, [step]: data }))
    if (step === 'base') setCurrentStep('amenities')
    else if (step === 'amenities') setCurrentStep('rooms')
  }

  const handleBack = () => {
    if (currentStep === 'amenities') {
      setCurrentStep('base')
    } else if (currentStep === 'rooms') {
      setCurrentStep('amenities')
    }
  }

  const handleSubmit = (values: RoomConfigurationFormValues) => {
    setFormData(prev => ({ ...prev, rooms: values }))
    // Here you would typically send the data to your backend
    console.log("Full form data:", { ...formData, rooms: values })
 
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Registra tu propiedad</h1>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className={`h-2 w-1/3 ${currentStep === 'base' ? 'bg-[#4A7598]' : 'bg-gray-200'}`}></div>
          <div className={`h-2 w-1/3 ${currentStep === 'amenities' ? 'bg-[#4A7598]' : 'bg-gray-200'}`}></div>
          <div className={`h-2 w-1/3 ${currentStep === 'rooms' ? 'bg-[#4A7598]' : 'bg-gray-200'}`}></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm">Información básica</span>
          <span className="text-sm">Amenidades</span>
          <span className="text-sm">Habitaciones</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'base' && (
          <motion.div
            key="base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PropertyBaseForm onSubmit={(data) => handleNext('base', data)} initialValues={formData.base} />
          </motion.div>
        )}

        {currentStep === 'amenities' && (
          <motion.div
            key="amenities"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AmenitiesForm onSubmit={(data) => handleNext('amenities', data)} onBack={handleBack} initialValues={formData.amenities} />
          </motion.div>
        )}

        {currentStep === 'rooms' && formData.amenities?.numberOfRooms && (
          <motion.div
            key="rooms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Configuración de habitaciones</h2>
            <p className="text-gray-600 mb-6">
              Por favor, configura cada una de las {formData.amenities.numberOfRooms} habitaciones.
            </p>
            <RoomConfigurationForm 
              numberOfRooms={parseInt(formData.amenities?.numberOfRooms || "0")} 
              onSubmit={handleSubmit}
              onBack={(data) => {
                setFormData(prev => ({ ...prev, rooms: data }))
                handleBack()
              }}
              initialValues={formData.rooms}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

