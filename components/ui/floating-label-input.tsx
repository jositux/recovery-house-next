"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

// Convertir el componente en forwardRef
export const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    React.useEffect(() => {
      setHasValue(!!props.value)
    }, [props.value])

    return (
      <div className="relative mb-4">
        <input
          {...props}
          ref={ref} // Agregar el ref aquí
          className={cn(
            "w-full px-4 py-4 text-base text-gray-700 border-2 border-gray-200 rounded-xl",
            "focus:outline-none focus:border-gray-400 transition-colors duration-200",
            "placeholder-transparent", // Hide the placeholder
            className,
          )}
          placeholder={label}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false)
            setHasValue(!!e.target.value)
            props.onBlur?.(e) // Asegurar compatibilidad con react-hook-form
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value)
            props.onChange?.(e)
          }}
        />
        <label
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none",
            isFocused || hasValue ? "-top-2 text-xs bg-white px-1 text-gray-600" : "top-4 text-base text-gray-500",
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)

FloatingLabelInput.displayName = "FloatingLabelInput" // Evitar warnings en React DevTools
