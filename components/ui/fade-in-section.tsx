"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ReactNode } from "react"

interface FadeInSectionProps {
  children: ReactNode
}

export function FadeInSection({ children }: FadeInSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  )
}

