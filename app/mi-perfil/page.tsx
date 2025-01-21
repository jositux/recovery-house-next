"use client"

import { useEffect, useState } from "react"
import { updateService } from "@/services/updateUserService"; // Adjust the path
import UpdateUserForm, { formSchema } from "@/components/forms/UpdateUserForm"; // Import the update form
import { z } from "zod"
// import CreditCardForm from '@/components/forms/CreditCardForm'
import { getCurrentUser, User } from "@/services/userService"

export default function UpdateUserPage() {
  const [registrationData, setRegistrationData] = useState<User | null>(null);  // Use User type
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("Token no encontrado. Inicia sesión nuevamente.")
        }

        // Get current user data
        const currentUser: User = await getCurrentUser(token);
        setRegistrationData(currentUser);  // Set user data as initial values
      } catch (err: unknown) { // Avoid using `any`, use `unknown` instead
        if (err instanceof Error) {
          setError(err.message); // Handle the error as an instance of `Error`
        } else {
          setError("Error inesperado");
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRegisterSubmit = async (values: z.infer<typeof formSchema>) => {
    setRegistrationData(values);  // Update registration data

    try {
      const updatedUser = await updateService.updateUser(values.id, values);
      console.log("Usuario actualizado con éxito:", updatedUser);
      // You can add success messages, redirects, or other actions here
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocurrió un error inesperado.");
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-md py-10">
        <h1 className="text-2xl font-bold mb-6">Actualizar Usuario</h1>

        {/* If there's an error, it will be displayed */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Show the form with the current user data as initial values */}
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <UpdateUserForm onSubmit={handleRegisterSubmit} initialValues={registrationData || undefined} />
        )}
      </div>
    </div>
  )
}
