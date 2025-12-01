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

import { MultiSelectCase } from "@/components/MultiSelectCase2"

import { useRouter, useParams } from 'next/navigation'

import { formSchema, type FormValues, type FileData, type Property } from "../types"

import GoogleMapsSelector, { type LocationDetails } from "@/components/google-maps-selector"

import { type Locale } from "@/lib/i18n" 

const translations = {
  es: {
    title: "Editar Propiedad",
    loading: "Cargando datos de la propiedad...",
    error: "Error al cargar la propiedad",
    
    legalDocs: "Documentos Legales",
    location: "Ubicación",
    guestInfo: "Información para el huésped",
    propType: "Tipo de Propiedad",

    taxIdEinNumber: "Número de Impuestos Tax ID/EIN",
    taxIdEinPlaceholder: "Tax ID/EIN",
    rntFile: "Archivo RNT",
    taxFile: "Archivo de Impuestos TAX ID",
    propName: "Nombre de la propiedad",
    propNamePlaceholder: "Nombre de la propiedad",
    propPhoto: "Foto de la Propiedad",
    description: "Describe tu propiedad",
    descriptionPlaceholder: "Describe las características de la propiedad",
    specializations: "Tratamientos en que se especializa",
    postalCode: "Código Postal",
    fullAddress: "Dirección Legal",
    fullAddressPlaceholder: "Dirección completa",
    address: "Dirección",
    latitude: "Latitud",
    longitude: "Longitud",
    hostName: "Nombre del anfitrión",
    hostNamePlaceholder: "Nombre del anfitrión",
    usefulInfo: "Información Util",
    usefulInfoPlaceholder: "Escribe un mensaje de bienvenida o instrucciones para tus huéspedes",
    
    stay: "Estancia",
    stayDesc: "Alojamiento para estancias cortas",
    recoveryHouse: "Casa de Recuperación",
    recoveryHouseDesc: "Alojamiento para recuperación post-operatoria",
    
    cancel: "CANCELAR",
    save: "GUARDAR",
    saving: "GUARDANDO...",
    
    rntRequired: "El archivo RNT es obligatorio",
    taxRequired: "El archivo TAX ID es obligatorio",
    imageRequired: "La imagen principal es obligatoria",
    noToken: "No access token found",
  },
  en: {
    title: "Edit Property",
    loading: "Loading property data...",
    error: "Error loading property",
    
    legalDocs: "Legal Documents",
    location: "Location",
    guestInfo: "Guest Information",
    propType: "Property Type",

    taxIdEinNumber: "Tax ID/EIN Number",
    taxIdEinPlaceholder: "Tax ID/EIN",
    rntFile: "RNT File",
    taxFile: "TAX ID File",
    propName: "Property Name",
    propNamePlaceholder: "Property name",
    propPhoto: "Property Photo",
    description: "Describe your property",
    descriptionPlaceholder: "Describe the characteristics of the property",
    specializations: "Specialized Treatments",
    postalCode: "Postal Code",
    fullAddress: "Legal Address",
    fullAddressPlaceholder: "Full address",
    address: "Address",
    latitude: "Latitude",
    longitude: "Longitude",
    hostName: "Host Name",
    hostNamePlaceholder: "Host name",
    usefulInfo: "Useful Information",
    usefulInfoPlaceholder: "Write a welcome message or instructions for your guests",

    stay: "Stay",
    stayDesc: "Accommodation for short stays",
    recoveryHouse: "Recovery House",
    recoveryHouseDesc: "Accommodation for post-operative recovery",
    
    cancel: "CANCEL",
    save: "SAVE",
    saving: "SAVING...",
    
    rntRequired: "The RNT file is mandatory",
    taxRequired: "The TAX ID file is mandatory",
    imageRequired: "The main image is mandatory",
    noToken: "No access token found",
  },
}


export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const urlParams = useParams();
  const lang = (urlParams.lang as Locale) || 'es';
  
  const t = translations[lang as keyof typeof translations] || translations.es

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
      setError(err instanceof Error ? err.message : t.error)
    } finally {
      setLoading(false)
    }
  }, [paramId, form, t.error])

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
        message: t.rntRequired,
      })
    }

    if (!isTaxValid) {
      form.setError("taxIdEINFile", {
        type: "manual",
        message: t.taxRequired,
      })
    }

    if (!currentImageId && !newImageFile) {
      form.setError("mainImage", {
        type: "manual",
        message: t.imageRequired,
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
        throw new Error(t.noToken)
      }

      let finalImageId = values.mainImage

      if (imageToDelete && accessToken) {
        try {
          await deleteFileService(imageToDelete, accessToken)
          console.log("Deleted image:", imageToDelete)
        } catch (error) {
          console.error("Error deleting image:", error)
        }
      }

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
        message: t.imageRequired,
      })
    }

    setNewImageFile(data.newFile)

    if (data.newFile || (data.existingImageId && !data.markedForDeletion)) {
      form.setValue("mainImage", data.existingImageId || "pending")
      form.clearErrors("mainImage")
    }
  }

  if (loading) {
    return  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    <p className="text-center p-4">{t.loading}</p>
  </div>    
  }

  if (error) {
    return <p className="text-center p-4 text-red-500">Error: {error}</p>
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4">
        <h1 className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}>{t.title}</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">{t.legalDocs}</h2>
              <FormField
                control={form.control}
                name="taxIdEIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.taxIdEinNumber}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder={t.taxIdEinPlaceholder} {...field} />
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
                          label={t.rntFile}
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
                          label={t.taxFile}
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
                    <FormLabel>{t.propName}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.propNamePlaceholder} {...field} />
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
                    <FormLabel>{t.propPhoto}</FormLabel>
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
                    <FormLabel>{t.description}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="h-full min-h-[100px]"
                        placeholder={t.descriptionPlaceholder}
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
                    <FormLabel>{t.specializations}</FormLabel>
                    <FormControl>
                      <MultiSelectCase value={field.value} onChange={field.onChange} lang={lang} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">{t.location}</h2>
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
                  lang={lang}
                />
              )}
              <div className="hidden">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.postalCode}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.postalCode} {...field} />
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
                    <FormLabel>{t.fullAddress}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.fullAddressPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <GoogleMapsSelector onLocationSelected={handleLocationSelected} defaultLocation={defaultLocation} lang={lang} />

              <div className="hidden">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.address}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.fullAddressPlaceholder} {...field} />
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
                      <FormLabel>{t.latitude}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder={t.latitude}
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
                      <FormLabel>{t.longitude}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder={t.longitude}
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
                    <FormLabel className="text-lg">{t.propType}</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UserTypeCard
                          icon={Home}
                          title={t.stay}
                          description={t.stayDesc}
                          selected={field.value === "Stay"}
                          onClick={() => field.onChange("Stay")}
                          aria-label="Select Stay as property type"
                        />
                        <UserTypeCard
                          icon={Building2}
                          title={t.recoveryHouse}
                          description={t.recoveryHouseDesc}
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
              <h2 className="text-lg">{t.guestInfo}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hostName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.hostName}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder={t.hostNamePlaceholder} {...field} />
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
                      <FormLabel>{t.usefulInfo}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder={t.usefulInfoPlaceholder}
                            {...field}
                            className="h-full min-h-[100px]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> {/* Cierre correcto del div grid */}
            </div> {/* Cierre correcto del div space-y-4 p-4 bg-white rounded-xl */}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 px-6 py-5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-transparent"
                onClick={handleCancel}
              >
                <X />
                {t.cancel}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Save className="animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save />
                    {t.save}
                  </>
                )}
              </Button>
            </div>

            {Object.values(form.formState.errors).length > 0 && (
              <div className="mt-4 space-y-1">
                {Object.entries(form.formState.errors).map(
                  ([fieldName, error]) => (
                    <div key={fieldName}>
                      <p className="text-red-500 text-sm">{error?.message}</p>

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