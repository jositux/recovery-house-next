"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingLabelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function FloatingLabelTextarea({ label, className, ...props }: FloatingLabelTextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    setHasValue(!!textareaRef.current?.value)
  }, [])

  return (
    <div className="relative mb-4">
      <textarea
        {...props}
        ref={textareaRef}
        className={cn(
          "w-full px-4 py-4 text-base text-gray-700 border-2 border-gray-200 rounded-xl min-h-[120px]",
          "focus:outline-none focus:border-gray-400 transition-colors duration-200",
          "placeholder-transparent resize-y", // Hide the placeholder and allow vertical resizing
          className,
        )}
        placeholder={label}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false)
          setHasValue(!!e.target.value)
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

