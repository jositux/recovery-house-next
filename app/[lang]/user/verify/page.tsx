"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Locale } from "@/lib/i18n"

const EmailVerificationPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const lang = (params.lang as Locale) || "es" // Default to 'es'
  const isSpanish = lang === "es"

  const token = searchParams.get("token")
  const verificationUrl = token ? `/webapi/users/register/verify-email?token=${token}` : ""

  const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "error">("verifying")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error")
        return
      }

      try {
        const response = await fetch(verificationUrl, { method: "GET" })

        if (response.redirected === true || response.status === 302) {
          setVerificationStatus("success")
          setTimeout(() => router.push("/login?message=aceptado"), 2000)
        } else if (response.status === 400) {
          setVerificationStatus("error")
        } 

      } catch (error) {
        console.error("Error verifying email:", error)
        setVerificationStatus("error")
      }
    }

    verifyEmail()
  }, [router, token, verificationUrl])

  return (
    <div className="flex flex-col items-center justify-center py-40 min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        {verificationStatus === "verifying" && (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <p className="mt-4 text-[#162F40]">
              {isSpanish ? "Validando usuario..." : "Verifying user..."}
            </p>
          </>
        )}

        {verificationStatus === "success" && (
          <>
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
            <p className="mt-4 text-green-600">
              {isSpanish ? "El usuario ha sido validado" : "User has been verified"}
            </p>
          </>
        )}

        {verificationStatus === "error" && (
          <>
            <XCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="mt-4 py-2 text-red-600">
              {isSpanish
                ? "El token se ha vencido, por favor pruebe crear de nuevo el usuario."
                : "The token has expired, please try creating the user again."}
            </p>
          </>
        )}

        {token && verificationStatus === "error" && (
           <Button 
             className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
             onClick={() => router.push("/registro")}
           >
             {isSpanish ? "Crear Usuario" : "Create User"}
           </Button>
        )}
      </div>
    </div>
  )
}

export default function SuspendedEmailVerificationPage() {
  return (
    <Suspense fallback={<div>{/* Aquí también se puede traducir */}Loading...</div>}>
      <EmailVerificationPage />
    </Suspense>
  )
}
