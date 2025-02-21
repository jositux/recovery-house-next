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

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Building2, Home, Save } from "lucide-react";

import { MultiSelectCase } from "@/components/MultiSelectCase";

import { useRouter } from "next/navigation";


import {
  formSchema,
  type FormValues,
  type FileData,
  //type RoomSkeleton,
  //type Room,
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

  const [defaultLocation, setDefaultLocation] = useState<LocationDetails>({
    address: "",
    lat: 0,
    lng: 0,
    postalCode: "",
  });

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
      patology: [],
      hostName: "",
      guestComments: "",
    },
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setParamId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const decodeHtmlAndRemoveTags = (html: string): string => {
    const textWithoutTags = html.replace(/<\/?[^>]+(>|$)/g, "")
    const txt = document.createElement("textarea")
    txt.innerHTML = textWithoutTags
    return txt.value
  }

  const fetchProperty = useCallback(async () => {
    if (!paramId) return;

    setLoading(true);
    try {
      const storedProperty = localStorage.getItem("selected_property");

      console.log(JSON.stringify(storedProperty))
      if (storedProperty) {
        const selectedProperty: Property = JSON.parse(storedProperty);

        if (selectedProperty) {
          setProperty(selectedProperty);

          console.log("patology", selectedProperty.patology);

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
            patology: selectedProperty.patology,
            hostName: selectedProperty.hostName,
            guestComments: decodeHtmlAndRemoveTags(selectedProperty.guestComments),
          });

          // Actualizar defaultLocation con los datos de la propiedad
          setDefaultLocation({
            address: selectedProperty.address || "",
            lat: selectedProperty.place.coordinates[0] || 0,
            lng: selectedProperty.place.coordinates[1] || 0,
            postalCode: selectedProperty.postalCode || "",
          });

          console.log("ID = ", selectedProperty.RNTFile)
          setRNTFileData(selectedProperty.RNTFile);
          setTaxFileData(selectedProperty.taxIdEINFile);

         
          form.setValue("patology", JSON.parse(String(selectedProperty.patology)))


        } else {
          throw new Error("Propiedad no encontrada");
        }
      } else {
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la propiedad"
      );
    } finally {
      setLoading(false);
    }
  }, [paramId]); // Dependencia de paramId para que se actualice si cambia

  useEffect(() => {
    if (paramId) {
      fetchProperty();
    }
  }, [paramId, fetchProperty]);

  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    //let propertyIdLocal = property?.id || "";

    try {
      const propertyUpdateData: PropertyData = {
        ...values,
        region: "default",
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
      };

      if (property) {
        await propertyUpdateService.updateProperty(
          property.id,
          propertyUpdateData
        );
        // propertyIdLocal = property.id;

        localStorage.removeItem("selected_property");

        router.push(`/propiedades/${property.id}`);

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
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Edita tu propiedad</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">Documentos Legales</h2>
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
            </div>
            <div className="space-y-4 p-4 bg-white rounded-xl">
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
                        className="h-full min-h-[100px]"
                        placeholder="Describe las características de la propiedad"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-4 bg-white rounded-xl">
              <FormField
                control={form.control}
                name="patology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tratamientos en que se especializa</FormLabel>
                    <FormControl>
                    <MultiSelectCase value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">Ubicación</h2>
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
            </div>

            <div className="space-y-4 hidden p-4 bg-white rounded-xl">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg">Tipo de Propiedad</FormLabel>
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
            </div>

            

            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">Información para el huésped</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hostName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del anfitrión</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Nombre del anfitrión"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Información Util</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="Escribe un mensaje de bienvenida o instrucciones para tus huéspedes"
                            {...field}
                            className="h-full min-h-[100px]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
              className="w-full mx-auto bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
}
