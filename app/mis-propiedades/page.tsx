"use client";

import React, { useEffect, useState } from "react";
import {
  getPropertiesByUserId,
  Property,
} from "@/services/propertyCollectionService";
import { getCurrentUser, User } from "@/services/userService";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]); // Proper typing for properties state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Token no encontrado. Inicia sesión nuevamente.");
        }

        const currentUser: User = await getCurrentUser(token);
        const data = await getPropertiesByUserId(currentUser.id, token);

        console.log("data cambiada", data);

        setProperties(data);
        localStorage.setItem("properties", JSON.stringify(data)); // Save to localStorage if data is loaded
      } catch (err: unknown) {
        // Type the error correctly
        if (err instanceof Error) {
          setError(err.message); // Handle the specific error message
        } else {
          setError("Error inesperado");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center p-4">Cargando propiedades...</p>;
  }

  if (error) {
    return <p className="text-center p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container min-h-screen mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Propiedades</h1>
        <Link href="/registrar-propiedad">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nueva Propiedad
          </Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-center">No hay propiedades disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="flex flex-col">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                <Link href={`/rooms/${property.id}`}>
                  <Image
                    src={`/webapi/assets/${
                      property.mainImage || "/placeholder.svg"
                    }`}
                    alt={property.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <CardTitle className="mb-2">{property.name}</CardTitle>
                <p className="text-sm text-gray-600 mb-2">
                  País: {property.country}
                </p>
                <p className="text-sm">
                  {property.description || "Sin descripción"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end p-4 gap-2">
              <Link href={`/propiedades/${property.id}`}>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" /> Ver
                  </Button>
                </Link>
                <Link href={`/editar-propiedad/${property.id}`}>
                  <Button variant="outline">
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
