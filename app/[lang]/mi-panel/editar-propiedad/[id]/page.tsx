"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload, type FileUploadHandle } from "../file-upload"
import { SingleImageUploaderWithId } from "../single-image-uploader-with-id"
import { LocationSelector } from "@/components/ui/location-selector"
import { UserTypeCard } from "@/components/ui/user-type-card"
import { propertyUpdateService, type PropertyData } from "@/services/propertyUpdateService"
import { uploadFile } from "@/services/fileUploadService"
import { deleteFile as deleteFileService } from "@/services/deleteFileService"
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ["latin"] })

import { Building2, Home, Save, X } from 'lucide-react'

import { MultiSelectCase } from "@/components/MultiSelectCase"

import { useRouter } from 'next/navigation'

import { formSchema, type FormValues, type FileData, type Property } from "../types"

import GoogleMapsSelector, { type LocationDetails } from "@/components/google-maps-selector"

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const handleLocationSelected = (details: LocationDetails) => {
    console.log("Detalles de la ubicación seleccionada:", details)
    form.setValue("address", details.address)
    form.setValue("latitude", details.lat)
    form.setValue("longitude", details.lng)
    form.setValue("postalCode", details.postalCode)
  }
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [paramId, setParamId] = useState<string | null>(null)

  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [imageToDelete, setImageToDelete] = useState<string | undefined>(undefined)
  const [originalImageId, setOriginalImageId] = useState<string | undefined>(undefined)
  const [currentImageId, setCurrentImageId] = useState<string | undefined>(undefined)

  const rntFileRef = useRef<FileUploadHandle>(null)
  const taxFileRef = useRef<FileUploadHandle>(null)

  const [rntFileToDelete, setRntFileToDelete] = useState<string | undefined>(undefined)
  const [taxFileToDelete, setTaxFileToDelete] = useState<string | undefined>(undefined)
  const [newRntFile, setNewRntFile] = useState<File | null>(null)
  const [newTaxFile, setNewTaxFile] = useState<File | null>(null)

  const [RNTFileData, setRNTFileData] = useState<FileData>({
    id: "",
    filename_download: "",
  })
  const [TaxFileData, setTaxFileData] = useState<FileData>({
    id: "",
    filename_download: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [defaultLocation, setDefaultLocation] = useState<LocationDetails>({
    address: "",
    lat: 0,
    lng: 0,
    postalCode: "",
  })

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
      address: "",
      patology: [],
      hostName: "",
      guestComments: "",
    },
  })


  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setParamId(resolvedParams.id)
    }
    getParams()
  }, [params])

  const decodeHtmlAndRemoveTags = (html: string): string => {
    const textWithoutTags = html.replace(/<\/?[^>]+(>|$)/g, "")
    const txt = document.createElement("textarea")
    txt.innerHTML = textWithoutTags
    return txt.value
  }

  const fetchProperty = useCallback(async () => {
    if (!paramId) return

    setLoading(true)
    try {
      const storedProperty = localStorage.getItem("selected_property")

      console.log(JSON.stringify(storedProperty))
      if (storedProperty) {
        const selectedProperty: Property = JSON.parse(storedProperty)

        if (selectedProperty) {
          setProperty(selectedProperty)

          setOriginalImageId(selectedProperty.mainImage.id)
          setCurrentImageId(selectedProperty.mainImage.id)

          console.log("patology", selectedProperty.patology)

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
            mainImage: selectedProperty.mainImage.id,
            RNTFile: selectedProperty.RNTFile.id,
            taxIdEINFile: selectedProperty.taxIdEINFile.id,
            address: selectedProperty.address,
            patology: selectedProperty.patology,
            hostName: selectedProperty.hostName,
            guestComments: decodeHtmlAndRemoveTags(selectedProperty.guestComments),
          })

          setDefaultLocation({
            address: selectedProperty.address || "",
            lat: selectedProperty.place.coordinates[0] || 0,
            lng: selectedProperty.place.coordinates[1] || 0,
            postalCode: selectedProperty.postalCode || "",
          })

          console.log("ID = ", selectedProperty.RNTFile)
          setRNTFileData(selectedProperty.RNTFile)
          setTaxFileData(selectedProperty.taxIdEINFile)

          form.setValue("patology", JSON.parse(String(selectedProperty.patology)))
        } else {
          throw new Error("Propiedad no encontrada")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la propiedad")
    } finally {
      setLoading(false)
    }
  }, [paramId])

  useEffect(() => {
    if (paramId) {
      fetchProperty()
    }
  }, [paramId, fetchProperty])

  const router = useRouter()

  const onSubmit = async (values: FormValues) => {
    const isRntValid = rntFileRef.current?.validate() ?? false
    const isTaxValid = taxFileRef.current?.validate() ?? false

    if (!isRntValid) {
      form.setError("RNTFile", {
        type: "manual",
        message: "El archivo RNT es obligatorio",
      })
    }

    if (!isTaxValid) {
      form.setError("taxIdEINFile", {
        type: "manual",
        message: "El archivo TAX ID es obligatorio",
      })
    }

    if (!currentImageId && !newImageFile) {
      form.setError("mainImage", {
        type: "manual",
        message: "La imagen principal es obligatoria",
      })
      return
    }

    if (!isRntValid || !isTaxValid) {
      return
    }

    setIsSubmitting(true)

    try {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        throw new Error("No access token found")
      }

      let finalImageId = values.mainImage

      // Delete marked image if exists
      if (imageToDelete && accessToken) {
        try {
          await deleteFileService(imageToDelete, accessToken)
          console.log("Deleted image:", imageToDelete)
        } catch (error) {
          console.error("Error deleting image:", error)
        }
      }

      // Upload new image if exists
      if (newImageFile && accessToken) {
        try {
          const uploadedId = await uploadFile(newImageFile)
          finalImageId = uploadedId.id
          console.log("Uploaded new image:", uploadedId)
        } catch (error) {
          console.error("Error uploading image:", error)
          throw error
        }
      }

      let finalRntId = rntFileRef.current?.getCurrentFileId() || ""
      let finalTaxId = taxFileRef.current?.getCurrentFileId() || ""

      // Eliminar archivos marcados para eliminación
      if (rntFileToDelete && accessToken) {
        try {
          await deleteFileService(rntFileToDelete, accessToken)
          console.log("Deleted RNT file:", rntFileToDelete)
        } catch (error) {
          console.error("Error deleting RNT file:", error)
        }
      }

      if (taxFileToDelete && accessToken) {
        try {
          await deleteFileService(taxFileToDelete, accessToken)
          console.log("Deleted TAX file:", taxFileToDelete)
        } catch (error) {
          console.error("Error deleting TAX file:", error)
        }
      }

      // Subir nuevos archivos si existen
      if (newRntFile) {
        try {
          const uploadedRnt = await uploadFile(newRntFile)
          finalRntId = uploadedRnt.id
          console.log("Uploaded new RNT file:", uploadedRnt)
        } catch (error) {
          console.error("Error uploading RNT file:", error)
          throw error
        }
      }

      if (newTaxFile) {
        try {
          const uploadedTax = await uploadFile(newTaxFile)
          finalTaxId = uploadedTax.id
          console.log("Uploaded new TAX file:", uploadedTax)
        } catch (error) {
          console.error("Error uploading TAX file:", error)
          throw error
        }
      }

      const propertyUpdateData: PropertyData = {
        ...values,
        mainImage: finalImageId,
        RNTFile: finalRntId,
        taxIdEINFile: finalTaxId,
        region: "default",
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
      }

      if (property) {
        await propertyUpdateService.updateProperty(property.id, propertyUpdateData)

        localStorage.removeItem("selected_property")

        router.push(`/mi-panel/propiedades/${property.id}`)
      }
    } catch (error) {
      console.error("Error al actualizar la propiedad:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (property) {
      router.push(`/mi-panel/propiedades/${property.id}`)
    }
  }

  const handleImageChange = (data: {
    existingImageId: string | null
    newFile: File | null
    markedForDeletion: boolean
  }) => {
    if (data.markedForDeletion && originalImageId) {
      setImageToDelete(originalImageId)
      setCurrentImageId(undefined)
      form.setValue("mainImage", "")
      form.setError("mainImage", {
        type: "manual",
        message: "La imagen principal es obligatoria",
      })
    }

    setNewImageFile(data.newFile)

    // Update form validation
    if (data.newFile || (data.existingImageId && !data.markedForDeletion)) {
      form.setValue("mainImage", data.existingImageId || "pending")
      form.clearErrors("mainImage")
    }
  }

  if (loading) {
    return  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    <p className="text-center p-4">Cargando datos de la propiedad...</p>
  </div>    
  }

  if (error) {
    return <p className="text-center p-4 text-red-500">Error: {error}</p>
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4">
        <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>Editar Propiedad</h1>
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
                      <FormControl>
                        <FileUpload
                          ref={rntFileRef}
                          label="Archivo RNT"
                          defaultFile={RNTFileData}
                          onChange={(file, fileIdToDelete) => {
                            setNewRntFile(file)
                            if (fileIdToDelete) {
                              setRntFileToDelete(fileIdToDelete)
                            }
                            if (file || fileIdToDelete) {
                              form.clearErrors("RNTFile")
                            }
                          }}
                          error={form.formState.errors.RNTFile?.message}
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
                      <FormControl>
                        <FileUpload
                          ref={taxFileRef}
                          label="Archivo de Impuestos TAX ID"
                          defaultFile={TaxFileData}
                          onChange={(file, fileIdToDelete) => {
                            setNewTaxFile(file)
                            if (fileIdToDelete) {
                              setTaxFileToDelete(fileIdToDelete)
                            }
                            if (file || fileIdToDelete) {
                              form.clearErrors("taxIdEINFile")
                            }
                          }}
                          error={form.formState.errors.taxIdEINFile?.message}
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
                      <SingleImageUploaderWithId
                        existingImageId={currentImageId}
                        newFile={newImageFile}
                        onChange={handleImageChange}
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

              <GoogleMapsSelector onLocationSelected={handleLocationSelected} defaultLocation={defaultLocation} />

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
                          <Input placeholder="Nombre del anfitrión" {...field} />
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

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 px-6 py-5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-transparent"
                onClick={handleCancel}
              >
                <X />
                CANCELAR
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Save className="animate-spin" />
                    GUARDANDO...
                  </>
                ) : (
                  <>
                    <Save />
                    GUARDAR
                  </>
                )}
              </Button>
            </div>

            {Object.values(form.formState.errors).length > 0 && (
              <div className="mt-4 space-y-1">
                {Object.entries(form.formState.errors).map(
                  ([fieldName, error]) => (
                    <div key={fieldName}>
                      {/* Mensaje principal */}
                      <p className="text-red-500 text-sm">{error?.message}</p>

                      {/* Mensajes adicionales (si existen múltiples) */}
                      {error?.types &&
                        Object.values(error.types).map(
                          (msg, i) => (
                            <p key={i} className="text-red-500 text-sm">
                              {String(msg)}
                            </p>
                          )
                        )}
                    </div>
                  )
                )}
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
