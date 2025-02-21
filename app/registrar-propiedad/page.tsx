"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/components/FileUpload"
import ImageUpload from "@/components/CoverPhotoUpload"
import { LocationSelector } from "@/components/ui/location-selector"
import { UserTypeCard } from "@/components/ui/user-type-card"
import { useRouter } from "next/navigation"

import type { LocationDetails } from "@/components/OSMSelector"
import dynamic from "next/dynamic"

const OpenStreetMapSelector = dynamic(() => import("@/components/OSMSelector").then((mod) => mod.default), {
  ssr: false,
})

import { propertyService, type PropertyData } from "@/services/propertyService"
//import { roomService, type RoomData } from "@/services/RoomService";

import { MultiSelectCase } from "@/components/MultiSelectCase"

import { Building2, Home, Save } from "lucide-react"

//import RoomAccordion from "@/components/RoomAccordion";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().min(6, "El la descripción es requerida."),
  country: z.string().min(1, "Por favor selecciona un país."),
  state: z.string().min(1, "Por favor selecciona un estado."),
  city: z.string().min(1, "Por favor selecciona una ciudad."),
  postalCode: z.string(),
  address: z.string(),
  fullAddress: z.string().min(5, "La dirección completa debe tener al menos 5 caracteres."),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  type: z.enum(["Stay", "RecoveryHouse"]),
  taxIdEIN: z.string().min(1, "El TAX ID es requerido."),
  mainImage: z.string().min(1, "La foto de la propiedad es obligatoria."),
  RNTFile: z.string().min(1, "El archivo RNT es obligatorio."),
  taxIdEINFile: z.string().min(1, "El archivo TAX ID es obligatorio."),
  hostName: z.string().min(1, "El nombre es obligatorio."),
  guestComments: z.string().min(1, "El campo es obligatorio."),
  patology: z.array(z.string()).min(1, "Selecciona al menos una patología."),
})

/*
interface Room {
  id: string;
  name: string;
  roomNumber: string;
  description: string;
  beds: number;
  capacity: number;
  pricePerNight: string;
  cleaningFee: string;
  mainImage: string;
  photos: string[];
  extraTags: string[];
  servicesTags: string[];
  propertyId: string;
}*/

type FormValues = z.infer<typeof formSchema>

export default function RegisterPropertyBasePage() {


  const handleLocationSelected = (details: LocationDetails) => {
    console.log("Detalles de la ubicación seleccionada:", details)
    form.setValue("address", details.address)
    form.setValue("latitude", details.lat)
    form.setValue("longitude", details.lng)
    form.setValue("postalCode", details.postalCode)
  }

  const defaultLocation = {
    address: "",
    lat: 0,
    lng: 0,
    postalCode: "",
  }

  const [imageId, setImageId] = useState<string>("") // Estado para guardar el ID de la imagen

  const [RNTFileData, setRNTFileData] = useState<{
    id: string
    filename_download: string
  }>({
    id: "",
    filename_download: "",
  })

  const [TaxFileData, setTaxFileData] = useState<{
    id: string
    filename_download: string
  }>({
    id: "",
    filename_download: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
      address: "",
      fullAddress: "",
      latitude: null,
      longitude: null,
      type: "Stay",
      taxIdEIN: "",
      mainImage: "",
      RNTFile: "",
      taxIdEINFile: "",
      patology: [],
      hostName: "",
      guestComments: "",
    },
  })

  const router = useRouter()

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      const propertyData: PropertyData = {
        name: values.name,
        description: values.description,
        country: values.country,
        state: values.state,
        city: values.city,
        postalCode: values.postalCode,
        address: values.address,
        fullAddress: values.fullAddress,
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
        type: values.type,
        taxIdEIN: values.taxIdEIN,
        mainImage: values.mainImage,
        RNTFile: values.RNTFile,
        taxIdEINFile: values.taxIdEINFile,
        hostName: values.hostName,
        guestComments: values.guestComments,
        patology: values.patology,
      }

      const response = await propertyService.createProperty(propertyData)

      if (response?.data?.id) {
        console.log("Propiedad creada con ID:", response.data.id)
        router.push(`/propiedades/${response.data.id}?rel=new`)
      } else {
        console.error("La respuesta no contiene un ID válido.")
      }
    } catch (error) {
      console.error("Error al registrar la propiedad:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /*
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "Habitación 1",
      roomNumber: "",
      description: "",
      beds: 1,
      capacity: 1,
      pricePerNight: "",
      cleaningFee: "",
      mainImage: "",
      photos: [],
      extraTags: [],
      servicesTags: [],
      propertyId: "0",
    },
  ]);*/

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Registra tu propiedad</h1>
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
                              setRNTFileData(response)
                              form.setValue("RNTFile", response.id)
                              form.clearErrors("RNTFile")
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
                              setTaxFileData(response)
                              form.setValue("taxIdEINFile", response.id)
                              form.clearErrors("taxIdEINFile")
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
                      <Input placeholder="Ej. Casa Azul ..." {...field} />
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
                        defaultImageId={""}
                        onImageIdChange={(newImageId) => {
                          if (newImageId !== imageId) {
                            setImageId(newImageId)
                            form.setValue("mainImage", newImageId)
                            form.clearErrors("mainImage")
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
              <LocationSelector
                defaultCountry={""}
                defaultState={""}
                defaultCity={""}
                onChange={({ country, state, city }) => {
                  form.setValue("country", country)
                  form.setValue("state", state)
                  form.setValue("city", city)
                }}
                error={{
                  country: form.formState.errors.country?.message,
                  state: form.formState.errors.state?.message,
                  city: form.formState.errors.city?.message,
                }}
              />

              <div className="">
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

              <OpenStreetMapSelector onLocationSelected={handleLocationSelected} defaultLocation={defaultLocation} />
            </div>
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
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)}
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
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
           

            {/* <div className="container mx-auto py-12 hidden">
              <h1 className="text-2xl font-bold mb-8">
                Datos de las habitaciones
              </h1>
              <RoomAccordion rooms={rooms} setRooms={setRooms} />
                        </div>*/}

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
                          <Input placeholder="Nombre del anfitrión" {...field} value={field.value || ""} />
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
                      <FormLabel>Información útil</FormLabel>
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

            <Button
              type="submit"
              className="w-full mx-auto bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Save className="animate-spin" /> {/* Icono de guardar con animación de giro */}
                  CARGANDO...
                </>
              ) : (
                <>
                  <Save /> {/* Icono de guardar */}
                  REGISTRAR PROPIEDAD
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

