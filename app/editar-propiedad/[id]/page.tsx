"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import ImageUpload from "@/components/CoverPhotoUpload";
import { LocationSelector } from "@/components/ui/location-selector";
import { UserTypeCard } from "@/components/ui/user-type-card";
import {
  propertyUpdateService,
  PropertyData,
} from "@/services/propertyUpdateService";
import { roomService, RoomData } from "@/services/RoomService";
import {
  roomUpdateService,
  RoomUpdateData,
} from "@/services/RoomUpdateService";
import { Building2, Home } from 'lucide-react';
import RoomAccordion from "@/components/RoomAccordion";
import { formSchema, FormValues, FileData, Room, Property } from "../types";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paramId, setParamId] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string>("");
  const [RNTFileData, setRNTFileData] = useState<FileData>({ id: "", filename_download: "" });
  const [TaxFileData, setTaxFileData] = useState<FileData>({ id: "", filename_download: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
      street: "",
      number: "",
      fullAddress: "",
      latitude: null,
      longitude: null,
      type: "Stay",
      taxIdEIN: "",
      mainImage: "",
      RNTFile: "",
      taxIdEINFile: "",
    },
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setParamId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (paramId) {
      const fetchProperty = () => {
        try {
          const storedProperties = localStorage.getItem("properties");
          if (storedProperties) {
            const properties: Property[] = JSON.parse(storedProperties);
            const selectedProperty = properties.find((prop) => prop.id === paramId);
            
            console.log(selectedProperty)
            
            if (selectedProperty) {
              setProperty(selectedProperty);
            } else {
              throw new Error("Propiedad no encontrada");
            }
          } else {
            throw new Error("No se encontraron propiedades en localStorage");
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al cargar la propiedad");
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [paramId]);

  useEffect(() => {
    if (property) {
      form.reset({
        id: property.id,
        name: property.name,
        description: property.description,
        country: property.country,
        state: property.state,
        city: property.city,
        postalCode: property.postalCode,
        street: property.street,
        number: property.number,
        fullAddress: property.fullAddress,
        latitude: property.latitude,
        longitude: property.longitude,
        type: property.type,
        taxIdEIN: property.taxIdEIN,
        mainImage: property.mainImage,
        RNTFile: property.RNTFile.id,
        taxIdEINFile: property.taxIdEINFile.id,
      });

      setRNTFileData(property.RNTFile);
      setTaxFileData(property.taxIdEINFile);
      setRooms(property.Rooms);
    }
  }, [property, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    let propertyIdLocal = "";

    try {
      const propertyUpdateData: PropertyData = {
        ...values,
        region: "default",
        Rooms: [],
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
      };

      if (property) {
        const response = await propertyUpdateService.updateProperty(
          property.id,
          propertyUpdateData
        );
        propertyIdLocal = response.data.id;
      }
    } catch (error) {
      console.error("Error al registrar la propiedad:", error);
    } finally {
      setIsSubmitting(false);
    }

    try {
      await Promise.all(rooms.map(async (room) => {
        const roomMainImage = room.mainImage || values.mainImage;
        const roomPhotos = room.photos.length > 0 ? room.photos : [roomMainImage];

        const roomData: RoomData = {
          name: room.name,
          roomNumber: room.roomNumber,
          description: room.description,
          beds: room.beds,
          capacity: room.capacity,
          pricePerNight: room.pricePerNight,
          cleaningFee: room.cleaningFee,
          mainImage: roomMainImage,
          photos: roomPhotos,
          extraTags: room.extraTags,
          servicesTags: room.servicesTags,
          propertyId: propertyIdLocal,
        };

        if (room.id.startsWith("room-")) {
          await roomService.createRoom(roomData);
        } else {
          const roomUpdateData: RoomUpdateData = { id: room.id, ...roomData };
          await roomUpdateService.updateRoom(roomUpdateData);
        }
      }));
    } catch (error) {
      console.error("Error creando o actualizando habitaciones:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center p-4">Cargando datos de la propiedad...</p>;
  }

  if (error) {
    return <p className="text-center p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Edita tu propiedad</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la propiedad</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la propiedad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe tu propiedad</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe las características de la propiedad"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {property && (
            <LocationSelector
              defaultCountry={property.country}
              defaultState={property.state}
              defaultCity={property.city}
              onChange={({ country, state, city }) => {
                form.setValue("country", country);
                form.setValue("state", state);
                form.setValue("city", city);
              }}
              error={{
                country: form.formState.errors.country?.message,
                state: form.formState.errors.state?.message,
                city: form.formState.errors.city?.message,
              }}
            />
          )}

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal</FormLabel>
                <FormControl>
                  <Input placeholder="Código Postal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calle</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la calle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Número de la propiedad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección Completa</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitud</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Latitud"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitud</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Longitud"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo de Propiedad</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UserTypeCard
                      icon={Home}
                      title="Estancia"
                      description="Alojamiento para estancias cortas"
                      selected={field.value === "Stay"}
                      onClick={() => field.onChange("Stay")}
                      aria-label="Select Stay as property type"
                    />
                    <UserTypeCard
                      icon={Building2}
                      title="Casa de Recuperación"
                      description="Alojamiento para recuperación post-operatoria"
                      selected={field.value === "RecoveryHouse"}
                      onClick={() => field.onChange("RecoveryHouse")}
                      aria-label="Select Recovery as property type"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxIdEIN"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Impuestos Tax ID/EIN</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Tax ID/EIN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="RNTFile"
              render={() => (
                <FormItem>
                  <FormLabel>Archivo RNT</FormLabel>
                  <FormControl>
                    <FileUpload
                      id={RNTFileData.id}
                      filename_download={RNTFileData.filename_download}
                      onUploadSuccess={(response) => {
                        if (response.id !== RNTFileData.id) {
                          setRNTFileData(response);
                          form.setValue("RNTFile", response.id);
                          form.clearErrors("RNTFile");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxIdEINFile"
              render={() => (
                <FormItem>
                  <FormLabel>Archivo de Impuestos TAX ID</FormLabel>
                  <FormControl>
                    <FileUpload
                      id={TaxFileData.id}
                      filename_download={TaxFileData.filename_download}
                      onUploadSuccess={(response) => {
                        if (response.id !== TaxFileData.id) {
                          setTaxFileData(response);
                          form.setValue("taxIdEINFile", response.id);
                          form.clearErrors("taxIdEINFile");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mainImage"
            render={() => (
              <FormItem>
                <FormLabel>Foto de la Propiedad</FormLabel>
                <FormControl>
                  <ImageUpload
                    defaultImageId={property?.mainImage}
                    onImageIdChange={(newImageId) => {
                      if (newImageId !== imageId) {
                        setImageId(newImageId);
                        form.setValue("mainImage", newImageId);
                        form.clearErrors("mainImage");
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  <strong>ID de la Imagen Actual:</strong>{" "}
                  {imageId || "No hay imagen cargada."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Habitaciones</h1>
            <RoomAccordion rooms={rooms} setRooms={setRooms} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar Información Base"}
          </Button>
        </form>
      </Form>
    </div>
  );
}