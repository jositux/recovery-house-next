"use client"

import { motion, AnimatePresence } from "framer-motion"
import MedicalSearchMobile from "@/components/MedicalSearchMobile"
import type { LocationOption } from "@/services/LocationService"

interface MobileSearchDropdownProps {
  isOpen: boolean
  onClose: () => void
  lang: string
  availableLocations: LocationOption[]
}

export default function MobileSearchDropdown({ isOpen, onClose, lang, availableLocations }: MobileSearchDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white overflow-hidden"
        >
          <div className="container mx-auto">
            <MedicalSearchMobile onSearch={onClose} lang={lang} availableLocations={availableLocations} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
