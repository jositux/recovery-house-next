"use client"

import { useRef, useState, useCallback, KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VerificationCodeInputProps {
  length?: number
  onComplete?: (code: string) => void
  disabled?: boolean
  email: string
  onResend?: () => void
}

export function VerificationCodeInput({
  length = 6,
  onComplete,
  disabled = false,
  email,
  onResend
}: VerificationCodeInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""))
  const [isCodeComplete, setIsCodeComplete] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const focusInput = (targetIndex: number) => {
    const input = inputRefs.current[targetIndex]
    if (input) {
      input.focus()
    }
  }

  const setInputRef = useCallback((el: HTMLInputElement | null, index: number) => {
    inputRefs.current[index] = el
  }, [])

  const handleChange = (index: number, value: string) => {
    const newCode = [...code]
    // Only allow numbers
    const sanitizedValue = value.replace(/[^0-9]/g, "")
    newCode[index] = sanitizedValue.slice(-1)
    setCode(newCode)

    // If we have a value, move to next input
    if (sanitizedValue && index < length - 1) {
      focusInput(index + 1)
    }

    // Check if code is complete
    setIsCodeComplete(newCode.every(digit => digit !== ""))
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      focusInput(index - 1)
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1)
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length)
    const sanitizedData = pastedData.replace(/[^0-9]/g, "")
    
    const newCode = [...code]
    sanitizedData.split("").forEach((char, index) => {
      if (index < length) {
        newCode[index] = char
      }
    })
    setCode(newCode)

    // Focus last input or next empty input
    const nextEmptyIndex = newCode.findIndex(digit => !digit)
    focusInput(nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1)

    setIsCodeComplete(newCode.filter(Boolean).length === length)
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Ingresa el código de verificación</h1>
        <p className="text-muted-foreground">
          Ingresa el código enviado a <span className="font-medium">{email}</span>
        </p>
      </div>

      {email && (
        <button
          onClick={onResend}
          className="text-[#39759E] hover:text-[#39759E] text-sm font-medium mt-2"
        >
          Reenviar código
        </button>
      )}

      <div className="flex gap-2 justify-center w-full">
        {code.map((digit, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            ref={(el) => setInputRef(el, index)}
            disabled={disabled}
            className={cn(
              "w-14 h-14 text-center text-lg font-medium",
              "focus:ring-2 focus:ring-[#39759E] focus:border-[#39759E]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label={`Digit ${index + 1} of verification code`}
          />
        ))}
      </div>

      <Button 
        className="w-full bg-[#39759E] hover:bg-[#39759E]"
        disabled={!isCodeComplete || disabled}
        onClick={() => isCodeComplete && onComplete && onComplete(code.join(""))}
      >
        Continuar
      </Button>
    </div>
  )
}

