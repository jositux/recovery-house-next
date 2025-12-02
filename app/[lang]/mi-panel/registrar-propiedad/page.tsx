"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { FileUpload, type FileUploadHandle } from "./file-upload";
import { SingleImageUploaderWithId } from "./single-image-uploader-with-id";
import { LocationSelector } from "@/components/ui/location-selector";
import { UserTypeCard } from "@/components/ui/user-type-card";
import { useRouter, useParams } from "next/navigation";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

import GoogleMapsSelector, {
  type LocationDetails,
} from "@/components/google-maps-selector";

import { propertyService, type PropertyData } from "@/services/propertyService";
import { uploadFile } from "@/services/fileUploadService";
import { deleteFile } from "@/services/deleteFileService";

import { MultiSelectCase } from "@/components/MultiSelectCase2";

import { Building2, Home, Save } from "lucide-react";

// Definición simple de tipos de idioma para referencia
import { type Locale } from "@/lib/i18n" 

// --- Objeto de traducción (T_MAP) ---
const T_MAP = {
  // Validación
  'El nombre es requerido.': { es: 'El nombre es requerido.', en: 'Name is required.' },
  'El la descripción es requerida.': { es: 'La descripción es requerida.', en: 'Description is required.' },
  'Por favor selecciona un país.': { es: 'Por favor selecciona un país.', en: 'Please select a country.' },
  'Por favor selecciona un estado.': { es: 'Por favor selecciona un estado.', en: 'Please select a state.' },
  'Por favor selecciona una ciudad.': { es: 'Por favor selecciona una ciudad.', en: 'Please select a city.' },
  'La dirección completa debe tener al menos 5 caracteres.': { es: 'La dirección completa debe tener al menos 5 caracteres.', en: 'Full address must be at least 5 characters.' },
  'El TAX ID es requerido.': { es: 'El TAX ID es requerido.', en: 'TAX ID is required.' },
  'La foto de la propiedad es obligatoria.': { es: 'La foto de la propiedad es obligatoria.', en: 'Property photo is mandatory.' },
  'El nombre del enfitrión es obligatorio.': { es: 'El nombre del anfitrión es obligatorio.', en: 'Host name is mandatory.' },
  'La información útil es obligatoria.': { es: 'La información útil es obligatoria.', en: 'Useful information is mandatory.' },
  'Selecciona al menos una patología.': { es: 'Selecciona al menos una patología.', en: 'Select at least one pathology.' },
  'Debes aceptar los términos y condiciones para continuar.': { es: 'Debes aceptar los términos y condiciones para continuar.', en: 'You must accept the terms and conditions to continue.' },
  // Alertas/Mensajes de error
  'No se encontró el token de acceso. Por favor inicia sesión nuevamente.': { es: 'No se encontró el token de acceso. Por favor inicia sesión nuevamente.', en: 'Access token not found. Please log in again.' },
  'El archivo RNT es obligatorio': { es: 'El archivo RNT es obligatorio', en: 'The RNT file is mandatory' },
  'El archivo TAX ID es obligatorio': { es: 'El archivo TAX ID es obligatorio', en: 'The TAX ID file is mandatory' },
  'Por favor selecciona una imagen para la propiedad': { es: 'Por favor selecciona una imagen para la propiedad', en: 'Please select an image for the property' },
  'Por favor carga el archivo RNT': { es: 'Por favor carga el archivo RNT', en: 'Please upload the RNT file' },
  'Por favor carga el archivo TAX ID': { es: 'Por favor carga el archivo TAX ID', en: 'Please upload the TAX ID file' },
  'Error al registrar la propiedad. Por favor intenta de nuevo.': { es: 'Error al registrar la propiedad. Por favor intenta de nuevo.', en: 'Error registering property. Please try again.' },
  // UI Texto
  'Registra tu propiedad': { es: 'Registra tu propiedad', en: 'Add your Property' },
  'Documentos Legales': { es: 'Documentos Legales', en: 'Legal Documents' },
  'Número de Impuestos Tax ID/EIN': { es: 'Número de Impuestos Tax ID/EIN', en: 'Tax ID/EIN Number' },
  'Archivo RNT': { es: 'Archivo RNT', en: 'RNT File' },
  'Archivo de Impuestos TAX ID': { es: 'Archivo de Impuestos TAX ID', en: 'TAX ID File' },
  'Nombre de la propiedad': { es: 'Nombre de la propiedad', en: 'Property Name' },
  'Ej. Casa Azul ...': { es: 'Ej. Casa Azul ...', en: 'Ex. Blue House ...' },
  'Foto de la Propiedad': { es: 'Foto de la Propiedad', en: 'Property Photo' },
  'Describe tu propiedad': { es: 'Describe tu propiedad', en: 'Describe Your Property' },
  'Describe las características de la propiedad': { es: 'Describe las características de la propiedad', en: 'Describe the property characteristics' },
  'Tratamientos en que se especializa': { es: 'Tratamientos en que se especializa', en: 'Specialized Treatments' },
  'Ubicación': { es: 'Ubicación', en: 'Location' },
  'Código Postal': { es: 'Código Postal', en: 'Postal Code' },
  'Dirección Legal': { es: 'Dirección Legal', en: 'Legal Address' },
  'Dirección completa': { es: 'Dirección completa', en: 'Full Address' },
  'Dirección': { es: 'Dirección', en: 'Address' },
  'Latitud': { es: 'Latitud', en: 'Latitude' },
  'Longitud': { es: 'Longitud', en: 'Longitude' },
  'Tipo de Propiedad': { es: 'Tipo de Propiedad', en: 'Property Type' },
  'Estancia': { es: 'Estancia', en: 'Stay' },
  'Alojamiento para estancias cortas': { es: 'Alojamiento para estancias cortas', en: 'Accommodation for short stays' },
  'Casa de Recuperación': { es: 'Casa de Recuperación', en: 'Recovery House' },
  'Alojamiento para recuperación post-operatoria': { es: 'Alojamiento para recuperación post-operatoria', en: 'Accommodation for post-operative recovery' },
  'Información para el huésped': { es: 'Información para el huésped', en: 'Guest Information' },
  'Nombre del anfitrión': { es: 'Nombre del anfitrión', en: 'Host Name' },
  'Información útil': { es: 'Información útil', en: 'Useful Information' },
  'Escribe un mensaje de bienvenida o instrucciones para tus huéspedes': { es: 'Escribe un mensaje de bienvenida o instrucciones para tus huéspedes', en: 'Write a welcome message or instructions for your guests' },
  'He leído y acepto los': { es: 'He leído y acepto los', en: 'I have read and accept the' },
  'Términos y Condiciones de la Plataforma': { es: 'Términos y Condiciones de la Plataforma', en: 'Platform Terms and Conditions' },
  'CARGANDO...': { es: 'CARGANDO...', en: 'LOADING...' },
  'REGISTRAR PROPIEDAD': { es: 'REGISTRAR PROPIEDAD', en: 'REGISTER PROPERTY' },
};


// Función de traducción
const t = (key: keyof typeof T_MAP, lang: Locale): string => {
  return T_MAP[key]?.[lang] || key;
};


export default function RegisterPropertyPage() {
  const router = useRouter();
  // Obtener el idioma de la URL
  const params = useParams();
  const lang = (params.lang as Locale) || 'es'; // Por defecto 'es'

  const handleLocationSelected = (details: LocationDetails) => {
    console.log("Detalles de la ubicación seleccionada:", details);
    form.setValue("address", details.address);
    form.setValue("latitude", details.lat);
    form.setValue("longitude", details.lng);
    form.setValue("postalCode", details.postalCode);
  };

  const defaultLocation = {
    address: "",
    lat: 0,
    lng: 0,
    postalCode: "",
  };

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [existingMainImageId, setExistingMainImageId] = useState<
    string | undefined
  >(undefined);

  const RNTFileRef = useRef<FileUploadHandle>(null);
  const taxFileRef = useRef<FileUploadHandle>(null);

  const [RNTFileToUpload, setRNTFileToUpload] = useState<File | null>(null);
  const [RNTFileToDelete, setRNTFileToDelete] = useState<string | undefined>(
    undefined
  );

  const [taxFileToUpload, setTaxFileToUpload] = useState<File | null>(null);
  const [taxFileToDelete, setTaxFileToDelete] = useState<string | undefined>(
    undefined
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultRNTFile = {
    id: "",
    filename_download: "",
  };

  const defaultTaxFile = {
    id: "",
    filename_download: "",
  };

  // 1. Esquema de validación que usa la función de traducción (t)
  const formSchema = z.object({
    name: z.string().min(1, t("El nombre es requerido.", lang)),
    description: z.string().min(6, t("El la descripción es requerida.", lang)),
    country: z.string().min(1, t("Por favor selecciona un país.", lang)),
    state: z.string().min(1, t("Por favor selecciona un estado.", lang)),
    city: z.string().min(1, t("Por favor selecciona una ciudad.", lang)),
    postalCode: z.string(),
    address: z.string(),
    fullAddress: z
      .string()
      .min(5, t("La dirección completa debe tener al menos 5 caracteres.", lang)),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    type: z.enum(["Stay", "RecoveryHouse"]),
    taxIdEIN: z.string().min(1, t("El TAX ID es requerido.", lang)),
    mainImage: z.string().min(1, t("La foto de la propiedad es obligatoria.", lang)),
    RNTFile: z.string(),
    taxIdEINFile: z.string(),
    hostName: z.string().min(1, t("El nombre del enfitrión es obligatorio.", lang)),
    guestComments: z.string().min(1, t("La información útil es obligatoria.", lang)),
    patology: z.array(z.string()).min(1, t("Selecciona al menos una patología.", lang)),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: t("Debes aceptar los términos y condiciones para continuar.", lang),
    }),
  });
  
  type FormValues = z.infer<typeof formSchema>;

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
      RNTFile: defaultRNTFile.id,
      taxIdEINFile: defaultTaxFile.id,
      patology: [],
      hostName: "",
      guestComments: "",
      acceptTerms: false,
    },
  });

  const handleMainImageChange = (data: {
    existingImageId: string | null;
    newFile: File | null;
    markedForDeletion: boolean;
  }) => {
    setMainImageFile(data.newFile);
    setExistingMainImageId(data.existingImageId || undefined);

    if (data.newFile) {
      form.setValue("mainImage", "pending-upload");
      form.clearErrors("mainImage");
    } else if (data.existingImageId) {
      form.setValue("mainImage", data.existingImageId);
      form.clearErrors("mainImage");
    } else {
      form.setValue("mainImage", "");
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        // Usamos t() para el mensaje de alerta
        alert(t("No se encontró el token de acceso. Por favor inicia sesión nuevamente.", lang));
        setIsSubmitting(false);
        return;
      }

      const isRNTFileValid = RNTFileRef.current?.validate();
      const isTaxFileValid = taxFileRef.current?.validate();

      if (!isRNTFileValid) {
        form.setError("RNTFile", { message: t("El archivo RNT es obligatorio", lang) });
        setIsSubmitting(false);
        return;
      }

      if (!isTaxFileValid) {
        form.setError("taxIdEINFile", {
          message: t("El archivo TAX ID es obligatorio", lang),
        });
        setIsSubmitting(false);
        return;
      }

      let finalMainImageId = existingMainImageId || "";

      if (mainImageFile) {
        const uploadResponse = await uploadFile(mainImageFile);
        finalMainImageId = uploadResponse.id;
      }

      if (!finalMainImageId) {
        // Usamos t() para el mensaje de alerta
        alert(t("Por favor selecciona una imagen para la propiedad", lang));
        setIsSubmitting(false);
        return;
      }

      const currentRNTFileId = RNTFileRef.current?.getCurrentFileId();
      const currentTaxFileId = taxFileRef.current?.getCurrentFileId();

      if (RNTFileToDelete) {
        await deleteFile(RNTFileToDelete, accessToken);
      }
      if (taxFileToDelete) {
        await deleteFile(taxFileToDelete, accessToken);
      }

      let finalRNTFileId = currentRNTFileId || "";
      let finalTaxFileId = currentTaxFileId || "";

      if (RNTFileToUpload) {
        const uploadResponse = await uploadFile(RNTFileToUpload);
        finalRNTFileId = uploadResponse.id;
      }

      if (taxFileToUpload) {
        const uploadResponse = await uploadFile(taxFileToUpload);
        finalTaxFileId = uploadResponse.id;
      }

      if (!finalRNTFileId || finalRNTFileId === "") {
        // Usamos t() para el mensaje de alerta
        alert(t("Por favor carga el archivo RNT", lang));
        setIsSubmitting(false);
        return;
      }

      if (!finalTaxFileId || finalTaxFileId === "") {
        // Usamos t() para el mensaje de alerta
        alert(t("Por favor carga el archivo TAX ID", lang));
        setIsSubmitting(false);
        return;
      }

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
        mainImage: finalMainImageId,
        RNTFile: finalRNTFileId,
        taxIdEINFile: finalTaxFileId,
        hostName: values.hostName,
        guestComments: values.guestComments,
        patology: values.patology,
      };

      const response = await propertyService.createProperty(propertyData);

      if (response?.data?.id) {
        console.log("Propiedad creada con ID:", response.data.id);
        // 2. Ajustamos la redirección para incluir el idioma
        router.push(`/${lang}/mi-panel/propiedades/${response.data.id}?rel=new`);
      } else {
        console.error("La respuesta no contiene un ID válido.");
      }
    } catch (error) {
      console.error("Error al registrar la propiedad:", error);
      // Usamos t() para el mensaje de alerta
      alert(t("Error al registrar la propiedad. Por favor intenta de nuevo.", lang));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4">
        <h1
          className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-8`}
        >
          {t("Registra tu propiedad", lang)}
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">{t("Documentos Legales", lang)}</h2>
              <FormField
                control={form.control}
                name="taxIdEIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Número de Impuestos Tax ID/EIN", lang)}</FormLabel>
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
                  render={({ }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          ref={RNTFileRef}
                          label={t("Archivo RNT", lang)}
                          defaultFile={defaultRNTFile}
                          onChange={(file, fileIdToDelete) => {
                            setRNTFileToUpload(file);
                            setRNTFileToDelete(fileIdToDelete);
                            if (file || fileIdToDelete) {
                              form.clearErrors("RNTFile");
                            }
                          }}
                          error={form.formState.errors.RNTFile?.message}
                        lang={lang}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxIdEINFile"
                  render={({ }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          ref={taxFileRef}
                          label={t("Archivo de Impuestos TAX ID", lang)}
                          defaultFile={defaultTaxFile}
                          onChange={(file, fileIdToDelete) => {
                            setTaxFileToUpload(file);
                            setTaxFileToDelete(fileIdToDelete);
                            if (file || fileIdToDelete) {
                              form.clearErrors("taxIdEINFile");
                            }
                          }}
                          error={form.formState.errors.taxIdEINFile?.message}
                        lang={lang}
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
                    <FormLabel>{t("Nombre de la propiedad", lang)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Ej. Casa Azul ...", lang)} {...field} />
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
                    <FormLabel>{t("Foto de la Propiedad", lang)}</FormLabel>
                    <FormControl>
                      <SingleImageUploaderWithId
                        existingImageId={existingMainImageId}
                        newFile={mainImageFile}
                        onChange={handleMainImageChange}
                        lang={lang}
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
                    <FormLabel>{t("Describe tu propiedad", lang)}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="h-full min-h-[100px]"
                        placeholder={t("Describe las características de la propiedad", lang)}
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
                    <FormLabel>{t("Tratamientos en que se especializa", lang)}</FormLabel>
                    <FormControl>
                      <MultiSelectCase
                        value={field.value}
                        onChange={field.onChange}
                        lang={lang}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">{t("Ubicación", lang)}</h2>
              <LocationSelector
                defaultCountry={""}
                defaultState={""}
                defaultCity={""}
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
                lang={lang}
              />

              <div className="">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Código Postal", lang)}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Código Postal", lang)} {...field} />
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
                    <FormLabel>{t("Dirección Legal", lang)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Dirección completa", lang)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <GoogleMapsSelector
                onLocationSelected={handleLocationSelected}
                defaultLocation={defaultLocation}
                lang={lang}
              />
            </div>
            <div className="hidden">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Dirección", lang)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Dirección completa", lang)} {...field} />
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
                    <FormLabel>{t("Latitud", lang)}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder={t("Latitud", lang)}
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
                    <FormLabel>{t("Longitud", lang)}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder={t("Longitud", lang)}
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

            <div className="space-y-4 hidden p-4 bg-white rounded-xl">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg">{t("Tipo de Propiedad", lang)}</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UserTypeCard
                          icon={Home}
                          title={t("Estancia", lang)}
                          description={t("Alojamiento para estancias cortas", lang)}
                          selected={field.value === "Stay"}
                          onClick={() => field.onChange("Stay")}
                          aria-label="Select Stay as property type"
                        />
                        <UserTypeCard
                          icon={Building2}
                          title={t("Casa de Recuperación", lang)}
                          description={t("Alojamiento para recuperación post-operatoria", lang)}
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
              <h2 className="text-lg">{t("Información para el huésped", lang)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hostName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Nombre del anfitrión", lang)}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t("Nombre del anfitrión", lang)}
                            {...field}
                            value={field.value || ""}
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
                      <FormLabel>{t("Información útil", lang)}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder={t("Escribe un mensaje de bienvenida o instrucciones para tus huéspedes", lang)}
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

            <div className="space-y-4 p-6 bg-white rounded-xl border-2 border-muted">
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row items-start space-x-3">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-5 w-5 rounded border-gray-300 text-[#39759E] focus:ring-[#39759E] focus:ring-2 cursor-pointer mt-0.5"
                        />
                      </FormControl>
                      <div className="flex-1 space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {t("He leído y acepto los", lang)}{" "}
                          <a
                            href={`/${lang}/terms`} // Asumimos que esta ruta se maneja globalmente o se adapta en un componente superior
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#39759E] hover:text-[#3a5a77] underline font-medium"
                          >
                            {t("Términos y Condiciones de la Plataforma", lang)}
                          </a>
                        </FormLabel>
                      </div>
                    </div>
                    <FormMessage className="mt-2" />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full mx-auto bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Save className="animate-spin" />
                  {t("CARGANDO...", lang)}
                </>
              ) : (
                <>
                  <Save />
                  {t("REGISTRAR PROPIEDAD", lang)}
                </>
              )}
            </Button>

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
  );
}