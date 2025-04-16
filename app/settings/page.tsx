"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileImageSection } from "@/components/profile/ProfileImageSection";
import { getCurrentUser, type User } from "@/services/userService";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setAccessToken(token);

    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        if (error instanceof Error && error.message.includes("Token")) {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Handle avatar update in the settings context
  const handleAvatarUpdate = async (newAvatarId: string) => {
    if (user && accessToken) {
      try {
        // Update user state with the new avatar
        setUser({ ...user, avatar: newAvatarId });
        
        // Here we could also update other settings or show notifications
        console.log("Avatar updated in settings page");
      } catch (error) {
        console.error("Error handling avatar update in settings:", error);
        throw error;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container min-h-screen mx-auto py-10 flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Configuración de cuenta</h1>
      
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        {/* Reusing the Profile Image Section component */}
        {user && accessToken && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">Imagen de perfil</h2>
            <ProfileImageSection 
              userId={user.id} 
              accessToken={accessToken}
              existingAvatarId={user.avatar}
            />
            <p className="mt-4 text-sm text-gray-500 text-center">
              Tu imagen de perfil se mostrará en todos los servicios de Recovery House.
            </p>
          </div>
        )}
        
        {/* Additional settings sections could be added here */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Otras configuraciones</h2>
          <p className="text-gray-500">Aquí podrían ir otras configuraciones de la cuenta.</p>
        </div>
      </div>
    </div>
  );
}
