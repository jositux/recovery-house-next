"use client";

import { useEffect, useState } from "react";
import {
  updateService,
  UpdateUserCredentials,
} from "@/services/updateUserService";
import UpdateUserForm from "@/components/forms/UpdateUserForm";
import { z } from "zod";
import { logoutUser } from "@/services/LogoutService";

// Define a new schema with removed validations for email and birthDate
const updatedFormSchema = z.object({
  id: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  first_name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  last_name: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres.",
  }),
  birthDate: z.string(), // Removed min length validation
  email: z.string(), // Removed email validation
  phone: z.string().min(2, {
    message: "El Telefono debe tener al menos 2 caracteres.",
  }),
  emergencyPhone: z.string().min(0, {
    message: "El Telefono debe tener al menos 2 caracteres.",
  }),
  address: z.string().min(2, {
    message: "El domicilio debe tener al menos 2 caracteres.",
  }),
  password: z.string().optional(),
});
import { useRouter } from "next/navigation";
import { getCurrentUser, User } from "@/services/userService";

export default function UpdateUserPage() {
  const router = useRouter();
  const [registrationData, setRegistrationData] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageTimer, setMessageTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Token no encontrado. Inicia sesión nuevamente.");
        }

        // Get current user data
        const currentUser: User = await getCurrentUser(token);
        setRegistrationData(currentUser);
      } catch (err: unknown) {
        let errorMessage = "Error inesperado";
        if (err instanceof Error) {
          errorMessage = err.message;
        }

        // Set the error state using temporary message
        showTemporaryMessage(null, errorMessage);

        // If token error, redirect to login
        if (errorMessage.includes("Token")) {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]); // Added router to dependency array

  // Función para limpiar los mensajes después de un tiempo
  const showTemporaryMessage = (
    successMsg: string | null,
    errorMsg: string | null,
    duration: number = 10000
  ): void => {
    // Limpiar cualquier timer existente
    if (messageTimer) {
      clearTimeout(messageTimer);
    }

    // Establecer los mensajes
    setSuccessMessage(successMsg);
    setError(errorMsg);

    // Configurar un nuevo timer para limpiar los mensajes
    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, duration);

    setMessageTimer(timer);
  };

  // Asegurar que los timers se limpien cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (messageTimer) {
        clearTimeout(messageTimer);
      }
    };
  }, [messageTimer]);

  const handleRegisterSubmit = async (
    values: z.infer<typeof updatedFormSchema>
  ): Promise<void> => {
    setRegistrationData((prev) => ({ ...prev, ...values } as User));

    // Check if password is changed (not empty)
    const passwordChanged = Boolean(
      values.password && values.password.trim() !== ""
    );

    try {
      // Create a copy of the values object for API submission
      const dataToSubmit: Partial<UpdateUserCredentials> = { ...values };

      // Remove email and birthDate from the update submission
      delete dataToSubmit.email;
      delete dataToSubmit.birthDate;

      // Only include password in the request if it's not empty
      if (!passwordChanged) {
        delete dataToSubmit.password;
      }

      // Send the update request
      await updateService.updateUser(
        values.id,
        dataToSubmit as UpdateUserCredentials
      );

      // If password was changed, log out the user
      if (passwordChanged) {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!refreshToken) {
          console.error("No se encontró el token de refresco")
          router.push("/login");
          return
        }

        // Llama al servicio de logout
        await logoutUser(refreshToken);

        // Show a success message
        showTemporaryMessage(
          "Tu contraseña ha sido actualizada. Por favor, inicia sesión nuevamente.",
          null
        );

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 4000);
      } else {
        // Store the updated name in localStorage
        localStorage.setItem(
          "nombre",
          values.first_name + " " + values.last_name
        );

        // Trigger the storage event for the header to update
        window.dispatchEvent(new Event("storage"));

        // Show success message that disappears after 10 seconds
        showTemporaryMessage("Perfil actualizado exitosamente", null);
      }
    } catch (error: unknown) {
      console.error("Error during form submission:", error);

      let errorMessage = "Ocurrió un error inesperado.";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error message:", errorMessage);
      }

      // Set the error state with our temporary message function
      showTemporaryMessage(null, errorMessage);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-md py-10">
        <h1 className="text-2xl font-bold mb-6">Actualizar Usuario</h1>

        {/* If there's an error, it will be displayed */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 mb-4 rounded"
            role="alert"
          >
            <p className="font-bold">¡Error!</p>
            <p>{error}</p>
          </div>
        )}

        {/* If there's a success message, it will be displayed */}
        {successMessage && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-4 mb-4 rounded"
            role="alert"
          >
            <p className="font-bold">¡Éxito!</p>
            <p>{successMessage}</p>
          </div>
        )}

        {/* Show the form with the current user data as initial values */}
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <UpdateUserForm
            onSubmit={handleRegisterSubmit}
            initialValues={registrationData || undefined}
            formSchema={updatedFormSchema}
          />
        )}
      </div>
    </div>
  );
}
