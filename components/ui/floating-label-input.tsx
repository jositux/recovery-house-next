"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id || `floating-label-${label.replace(/\s+/g, "-").toLowerCase()}`

    return (
      <div className="relative mb-4">
        <input
          {...props}
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 pt-6 pb-2 text-base text-gray-700 border-2 border-gray-300 rounded-xl",
            "focus:outline-none focus:border-blue-500 placeholder-transparent",
            className
          )}
          placeholder={label}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-4 top-2 text-xs text-gray-600 bg-white px-1 transition-all",
            "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500",
            "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)

FloatingLabelInput.displayName = "FloatingLabelInput"
