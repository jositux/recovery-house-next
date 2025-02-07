"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button" // Usa tu sistema de UI si tienes uno

// Component that will be wrapped in Suspense
const EmailVerificationPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const verificationUrl = token ? `/webapi/users/registro/verify-email?token=${token}` : ""

  const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "error">("verifying")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error")
        return
      }

      try {
        const response = await fetch(verificationUrl, {
          method: "GET",
        })

        console.log("response", response)

        if (response.redirected === true) {
          setVerificationStatus("success")
          setTimeout(() => router.push("/login?message=aceptado"), 2000)
        }

        if (response.status === 302) {
          setVerificationStatus("success")
          setTimeout(() => router.push("/login"), 2000)
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
    <div className="flex flex-col items-center justify-center py-40 min-h-fit bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        {verificationStatus === "verifying" && (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <p className="mt-4 text-[#162F40]">Validando usuario...</p>
          </>
        )}

        {verificationStatus === "success" && (
          <>
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
            <p className="mt-4 text-green-600">El usuario ha sido validado</p>
          </>
        )}

        {verificationStatus === "error" && (
          <>
            <XCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="mt-4 py-2 text-red-600">
              El token se ha vencido, por favor pruebe crear de nuevo el usuario.
            </p>
          </>
        )}

        {token && verificationStatus === "error" && (
           <Button 
           className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
           onClick={() => router.push("/registro")}
         >
           Crear Usuario
         </Button>
        )}
      </div>
    </div>
  )
}

export default function SuspendedEmailVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerificationPage />
    </Suspense>
  )
}
