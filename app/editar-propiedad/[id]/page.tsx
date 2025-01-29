"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  type PropertyData,
} from "@/services/propertyUpdateService";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { roomService, type RoomData } from "@/services/RoomService";
import { roomDeleteService } from "@/services/RoomDeleteService";

import { Building2, Home, Save } from "lucide-react";
import RoomAccordion from "@/components/RoomAccordion";
import {
  formSchema,
  type FormValues,
  type FileData,
  type RoomSkeleton,
  type Room,
  type Property,
} from "../types";

import OpenStreetMapSelector, {
  type LocationDetails,
} from "@/components/OSMSelector";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const handleLocationSelected = (details: LocationDetails) => {
    console.log("Detalles de la ubicación seleccionada:", details);
    form.setValue("address", details.address);
    form.setValue("latitude", details.lat);
    form.setValue("longitude", details.lng);
    form.setValue("postalCode", details.postalCode);
  };

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paramId, setParamId] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string>("");
  const [RNTFileData, setRNTFileData] = useState<FileData>({
    id: "",
    filename_download: "",
  });
  const [TaxFileData, setTaxFileData] = useState<FileData>({
    id: "",
    filename_download: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [defaultLocation, setDefaultLocation] = useState<LocationDetails>({
    address: "",
    lat: 0,
    lng: 0,
    postalCode: "",
  });

  const [roomsToDelete, setRoomsDelete] = useState<string[]>([]); // Added state for rooms to delete

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
      fullAddress: "",
      latitude: null,
      longitude: null,
      type: "Stay",
      taxIdEIN: "",
      mainImage: "",
      RNTFile: "",
      taxIdEINFile: "",
      address: "", // Added address field
    },
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setParamId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Función para convertir de RoomSkeleton a Room
  function convertRoomSkeletonToRoom(roomSkeleton: RoomSkeleton): Room {
    return {
      ...roomSkeleton, // Copiar todas las propiedades
      photos: roomSkeleton.photos.map((photo) => photo.directus_files_id.id), // Extraer solo el `id` de cada foto
      extraTags: roomSkeleton.extraTags.map((tag) => tag.ExtraTags_id), // Extraer solo el `ExtraTags_id`
      servicesTags: roomSkeleton.servicesTags.map((tag) => tag.serviceTags_id), // Extraer solo el `serviceTags_id`
    };
  }

  // Función para convertir un array de RoomSkeleton a un array de Room
  function convertRoomSkeletonArrayToRoomArray(
    roomSkeletonArray: RoomSkeleton[]
  ): Room[] {
    return roomSkeletonArray.map((roomSkeleton) =>
      convertRoomSkeletonToRoom(roomSkeleton)
    );
  }

  const fetchProperty = useCallback(async () => {
    if (!paramId) return;
  
    setLoading(true);
    try {
      const storedProperties = localStorage.getItem("properties");
      if (storedProperties) {
        const properties: Property[] = JSON.parse(storedProperties);
        const selectedProperty = properties.find((prop) => prop.id === paramId);
  
        if (selectedProperty) {
          setProperty(selectedProperty);
  
          // Actualizar el formulario con los datos de la propiedad
          form.reset({
            id: selectedProperty.id,
            name: selectedProperty.name,
            description: selectedProperty.description,
            country: selectedProperty.country,
            state: selectedProperty.state,
            city: selectedProperty.city,
            postalCode: selectedProperty.postalCode,
            fullAddress: selectedProperty.fullAddress,
            latitude: selectedProperty.place.coordinates[0],
            longitude: selectedProperty.place.coordinates[1],
            type: selectedProperty.type,
            taxIdEIN: selectedProperty.taxIdEIN,
            mainImage: selectedProperty.mainImage,
            RNTFile: selectedProperty.RNTFile.id,
            taxIdEINFile: selectedProperty.taxIdEINFile.id,
            address: selectedProperty.address,
          });
  
          // Actualizar defaultLocation con los datos de la propiedad
          setDefaultLocation({
            address: selectedProperty.address || "",
            lat: selectedProperty.place.coordinates[0] || 0,
            lng: selectedProperty.place.coordinates[1] || 0,
            postalCode: selectedProperty.postalCode || "",
          });
  
          setRNTFileData(selectedProperty.RNTFile);
          setTaxFileData(selectedProperty.taxIdEINFile);
  
          const roomArray: Room[] = convertRoomSkeletonArrayToRoomArray(
            selectedProperty.Rooms
          );
          setRooms(roomArray);
  
          const roomIds = roomArray.map((room) => room.id);
          setRoomsDelete(roomIds);
        } else {
          throw new Error("Propiedad no encontrada");
        }
      } else {
        throw new Error("No se encontraron propiedades en localStorage");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la propiedad"
      );
    } finally {
      setLoading(false);
    }
  }, [paramId]);  // Dependencia de paramId para que se actualice si cambia
  
  useEffect(() => {
    if (paramId) {
      fetchProperty();
    }
  }, [paramId, fetchProperty]); 

  const onSubmit = async (values: FormValues) => {
    await Promise.all(
      roomsToDelete.map(async (room) => {
        await roomDeleteService.deleteRoom(room);
      })
    );

    setIsSubmitting(true);
    let propertyIdLocal = property?.id || "";
    const createdRoomIds: string[] = [];

    try {
      await Promise.all(
        rooms.map(async (room) => {
          const roomMainImage = room.mainImage || values.mainImage;
          const roomPhotos =
            room.photos.length > 0 ? room.photos : [roomMainImage];

          const roomData: RoomData = {
            id: room.id || "",
            name: room.name || "Habitación sin nombre",
            roomNumber: room.roomNumber || "",
            description: room.description || "",
            beds: room.beds,
            capacity: room.capacity,
            pricePerNight: room.pricePerNight,
            cleaningFee: room.cleaningFee,
            mainImage: roomMainImage,
            photos: roomPhotos,
            extraTags: room.extraTags,
            servicesTags: room.servicesTags,
            propertyId: propertyIdLocal || "",
          };

          const response = await roomService.createRoom(roomData);

          if (response?.id) {
            createdRoomIds.push(response.id);
          } else {
            console.warn("La respuesta no contiene un ID válido:", response);
          }

          return response.id;
        })
      );
    } catch (error) {
      console.error("Error creando o actualizando habitaciones:", error);
    } finally {
      setIsSubmitting(false);
    }

    setRoomsDelete(createdRoomIds);

    try {
      const propertyUpdateData: PropertyData = {
        ...values,
        region: "default",
        Rooms: createdRoomIds,
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
      };

      if (property) {
        await propertyUpdateService.updateProperty(
          property.id,
          propertyUpdateData
        );
        propertyIdLocal = property.id;

        console.log(propertyIdLocal);

        toast("¡Los cambios se han guardado con éxito!");
      }
    } catch (error) {
      console.error("Error al registrar la propiedad:", error);
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
    <div className="container mx-auto max-w-2xl py-10 p-4">
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
          <div className="hidden">
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
          </div>

          <FormField
            control={form.control}
            name="fullAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección Legal</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <OpenStreetMapSelector
            onLocationSelected={handleLocationSelected}
            defaultLocation={defaultLocation}
          />

          <div className="hidden">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          e.target.value
                            ? Number.parseFloat(e.target.value)
                            : null
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
                          e.target.value
                            ? Number.parseFloat(e.target.value)
                            : null
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

          <div className="container mx-auto py-12">
            <h1 className="text-2xl font-bold mb-8">
              Datos de las habitaciones
            </h1>
            <RoomAccordion rooms={rooms} setRooms={setRooms} />
          </div>

          {/*<div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Habitación/es:</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(rooms, null, 2)}
            </pre>
                  </div>*/}

<ToastContainer
        position="top-right" // Posición del toast
        autoClose={8000} // Tiempo en milisegundos hasta que el toast desaparezca
        hideProgressBar={true} // Barra de progreso visible
        newestOnTop={false} // Los nuevos toasts van arriba o abajo
        closeOnClick // Se cierra cuando se hace click
        rtl={false} // Soporte para lenguajes RTL
      />
   

          <Button
            type="submit"
            className="w-full mx-auto bg-[#4A7598] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Save className="animate-spin" />{" "}
                {/* Icono de guardar con animación de giro */}
                GUARDANDO...
              </>
            ) : (
              <>
                <Save /> {/* Icono de guardar */}
                GUARDAR PROPIEDAD
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
