"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
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

// File handling imports
import { FileUpload, type FileUploadHandle } from "./file-upload";
import { uploadFile } from "@/services/fileUploadService";
import { deleteFile } from "@/services/deleteFileService";

import {
  providerService,
  ProviderData,
} from "@/services/providerUpdateService";
import { LocationSelector } from "@/components/ui/location-selector";
import { CollectionExtraTags } from "@/components/collectionExtraTags";
import { getProvidersByUserId } from "@/services/providerCollectionService";
import { getExtraTags } from "@/services/extraTagsService";
import { getCurrentUser } from "@/services/userService";
import { useRouter, useParams } from "next/navigation"; // ✅ Añadido useParams
import { Fraunces } from "next/font/google";
import { Loader2, Save } from "lucide-react";

// Tipos de idioma (asumo que existe este path)
import { type Locale } from "@/lib/i18n";

const fraunces = Fraunces({ subsets: ["latin"] });

// ===============================================================
// 📚 Objeto de Traducciones
// ===============================================================

type TranslationText = {
  // Zod Validation Messages
  nameRequired: string;
  emailInvalid: string;
  phoneRequired: string;
  countryRequired: string;
  stateRequired: string;
  cityRequired: string;
  descriptionRequired: string;
  taxIdRequired: string;
  RNTFileRequired: string;
  taxIdFileRequired: string;

  // UI Texts
  pageTitle: string;
  loadingData: string;
  legalInfoTitle: string;
  taxIdLabel: string;
  RNTFileLabel: string;
  taxIdFileLabel: string;
  serviceNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  servicesOfferedTitle: string;
  locationTitle: string;
  buttonSave: string;
  buttonUpdating: string;

  // Alert Messages
  errorNoToken: string;
  errorFetchingData: string;
  errorRNTFileId: string;
  errorTaxFileId: string;
  errorUpdateProvider: string;
  successTitle: string;
  successMessage: string;
  alertErrorRNTFile: string;
  alertErrorTaxFile: string;
};

const translations: Record<string, TranslationText> = {
  es: {
    // Zod Validation Messages
    nameRequired: "El nombre es requerido.",
    emailInvalid: "Debe ser un email válido.",
    phoneRequired: "El teléfono es requerido.",
    countryRequired: "Por favor selecciona un país.",
    stateRequired: "Por favor selecciona un estado.",
    cityRequired: "Por favor selecciona una ciudad.",
    descriptionRequired: "La descripción es requerida.",
    taxIdRequired: "El TAX ID es requerido.",
    RNTFileRequired: "El archivo RNT es obligatorio.",
    taxIdFileRequired: "El archivo TAX ID es obligatorio.",

    // UI Texts
    pageTitle: "Actualizar Servicio",
    loadingData: "Cargando datos del servicio...",
    legalInfoTitle: "Información Legal",
    taxIdLabel: "Número de impuestos ID/EIN",
    RNTFileLabel: "Archivo RNT",
    taxIdFileLabel: "Archivo de Impuestos TAX ID",
    serviceNameLabel: "Nombre del Servicio",
    emailLabel: "Email",
    phoneLabel: "Teléfono",
    descriptionLabel: "Describe el servicio que ofreces",
    descriptionPlaceholder: "Describe las características",
    servicesOfferedTitle: "Servicios Ofrecidos",
    locationTitle: "Dónde ofrece su servicio?",
    buttonSave: "Guardar",
    buttonUpdating: "Actualizando...",

    // Alert Messages
    errorNoToken:
      "No se encontró el token de acceso. Por favor inicia sesión nuevamente.",
    errorFetchingData: "Error al cargar los datos del proveedor:",
    errorRNTFileId:
      "Error al obtener el ID del archivo RNT después de la carga.",
    errorTaxFileId:
      "Error al obtener el ID del archivo TAX ID después de la carga.",
    errorUpdateProvider:
      "Error al actualizar el proveedor. Por favor intenta de nuevo.",
    successTitle: "¡Éxito!",
    successMessage: "¡Proveedor actualizado con éxito!",
    alertErrorRNTFile: "Error al cargar el archivo RNT. Intenta de nuevo.",
    alertErrorTaxFile: "Error al cargar el archivo TAX ID. Intenta de nuevo.",
  },
  en: {
    // Zod Validation Messages
    nameRequired: "The name is required.",
    emailInvalid: "Must be a valid email.",
    phoneRequired: "The phone number is required.",
    countryRequired: "Please select a country.",
    stateRequired: "Please select a state.",
    cityRequired: "Please select a city.",
    descriptionRequired: "The description is required.",
    taxIdRequired: "The TAX ID is required.",
    RNTFileRequired: "The RNT file is mandatory.",
    taxIdFileRequired: "The TAX ID file is mandatory.",

    // UI Texts
    pageTitle: "Update Service",
    loadingData: "Loading service data...",
    legalInfoTitle: "Legal Information",
    taxIdLabel: "Tax ID/EIN Number",
    RNTFileLabel: "RNT File",
    taxIdFileLabel: "TAX ID File",
    serviceNameLabel: "Service Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    descriptionLabel: "Describe the service you offer",
    descriptionPlaceholder: "Describe the characteristics",
    servicesOfferedTitle: "Services Offered",
    locationTitle: "Where do you offer your service?",
    buttonSave: "Save",
    buttonUpdating: "Updating...",

    // Alert Messages
    errorNoToken: "Access token not found. Please log in again.",
    errorFetchingData: "Error loading provider data:",
    errorRNTFileId: "Error getting RNT file ID after upload.",
    errorTaxFileId: "Error getting TAX ID file ID after upload.",
    errorUpdateProvider: "Error updating provider. Please try again.",
    successTitle: "Success!",
    successMessage: "Provider updated successfully!",
    alertErrorRNTFile: "Error uploading RNT file. Please try again.",
    alertErrorTaxFile: "Error uploading TAX ID file. Please try again.",
  },
};

export default function RegisterPropertyBasePage() {
  const router = useRouter();

  // 🌐 Lógica de Idioma
  const params = useParams();
  // Asumimos que el idioma se pasa como `lang` en los parámetros
  const lang = (params.lang as Locale) || "es";
  const texts =
    translations[lang as keyof typeof translations] || translations.en;

  // 💡 Ajuste dinámico del esquema Zod
  const formSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string().min(1, texts.nameRequired),
    email: z.string().email(texts.emailInvalid),
    phone: z.string().min(1, texts.phoneRequired),
    country: z.string().min(1, texts.countryRequired),
    state: z.string().min(1, texts.stateRequired),
    city: z.string().min(1, texts.cityRequired),
    membership: z.string(),
    description: z.string().min(6, texts.descriptionRequired),
    taxIdEIN: z.string().min(1, texts.taxIdRequired),
    RNTFile: z.string().min(1, texts.RNTFileRequired),
    taxIdEINFile: z.string().min(1, texts.taxIdFileRequired),
    extraTags: z.array(z.string()).default([]),
    serviceTags: z.array(z.string()).default([]),
    subscriptionPrice: z.string().default(""),
    subscriptionType: z.string().default(""),
    price: z.string().default(""),
  });

  type FormValues = z.infer<typeof formSchema>;

  const [extraTags, setExtraTags] = useState<
    {
      id: string;
      name: string;
      name_en: string;
      icon: string;
      enable_property: boolean;
      enable_services: boolean;
    }[]
  >([]);
  const [defaultTags, setDefaultTags] = useState<string[]>([]);

  const [defaultLocation, setDefaultLocation] = useState<{
    country: string;
    state: string;
    city: string;
  } | null>(null);

  const [initialRNTFile, setInitialRNTFile] = useState<
    { id: string; filename_download: string } | undefined
  >(undefined);
  const [initialTaxFile, setInitialTaxFile] = useState<
    { id: string; filename_download: string } | undefined
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      userId: "",
      name: "",
      email: "",
      phone: "",
      country: "",
      state: "",
      city: "",
      description: "",
      membership: "",
      taxIdEIN: "",
      RNTFile: "",
      taxIdEINFile: "",
      extraTags: [],
      serviceTags: [],
    },
  });

  const { setValue, setError } = form;

  useEffect(() => {
    const fetchProviderData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const currentUser = await getCurrentUser(token);
        const data = await getProvidersByUserId(currentUser.id, token);
        if (data.length > 0) {
          const provider = data[0];

          form.reset({
            id: provider.id,
            userId: provider.userId,
            name: provider.name,
            email: provider.email,
            phone: provider.phone,
            country: provider.country,
            state: provider.state,
            city: provider.city,
            description: provider.description,
            membership: provider.membership,
            taxIdEIN: provider.taxIdEIN,
            RNTFile: provider.RNTFile?.id || "",
            taxIdEINFile: provider.taxIdEINFile?.id || "",
            extraTags: provider.extraTags,
            serviceTags: provider.serviceTags,
          });

          if (provider.RNTFile?.id) {
            setInitialRNTFile({
              id: provider.RNTFile.id,
              filename_download: provider.RNTFile.filename_download,
            });
          }

          if (provider.taxIdEINFile?.id) {
            setInitialTaxFile({
              id: provider.taxIdEINFile.id,
              filename_download: provider.taxIdEINFile.filename_download,
            });
          }

          setDefaultLocation({
            country: provider.country,
            state: provider.state,
            city: provider.city,
          });

          setDefaultTags(provider.extraTags || []);
        }
      } catch (error) {
        console.error(texts.errorFetchingData, error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProviderData();
  }, [form, texts]); // Dependencia de 'texts' para el mensaje de error

  useEffect(() => {
    const loadTags = async () => {
      try {
        const extraTagsData = await getExtraTags();
        setExtraTags(extraTagsData);
      } catch (error) {
        console.error(error);
      }
    };
    loadTags();
  }, []);

  const selectedExtraTags = useWatch({
    control: form.control,
    name: "extraTags",
  });

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      if (JSON.stringify(tags) !== JSON.stringify(selectedExtraTags)) {
        setValue("extraTags", tags, { shouldDirty: true });
      }
    },
    [selectedExtraTags, setValue]
  );

  const handleRNTFileChange = (
    file: File | null,
    fileIdToDelete: string | undefined
  ) => {
    setRNTFileToUpload(file);
    setRNTFileToDelete(fileIdToDelete);
    if (file || fileIdToDelete) {
      form.clearErrors("RNTFile");
      form.setValue(
        "RNTFile",
        file ? "pending-upload" : fileIdToDelete || initialRNTFile?.id || ""
      );
    } else {
      form.setValue("RNTFile", "");
    }
  };

  const handleTaxFileChange = (
    file: File | null,
    fileIdToDelete: string | undefined
  ) => {
    setTaxFileToUpload(file);
    setTaxFileToDelete(fileIdToDelete);
    if (file || fileIdToDelete) {
      form.clearErrors("taxIdEINFile");
      form.setValue(
        "taxIdEINFile",
        file ? "pending-upload" : fileIdToDelete || initialTaxFile?.id || ""
      );
    } else {
      form.setValue("taxIdEINFile", "");
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert(texts.errorNoToken);
      setIsSubmitting(false);
      return;
    }

    // 2. Validar archivos requeridos usando la referencia
    const isRNTFileValid = RNTFileRef.current?.validate();
    const isTaxFileValid = taxFileRef.current?.validate();

    if (!isRNTFileValid) {
      setError("RNTFile", { message: texts.RNTFileRequired });
      setIsSubmitting(false);
      return;
    }
    if (!isTaxFileValid) {
      setError("taxIdEINFile", { message: texts.taxIdFileRequired });
      setIsSubmitting(false);
      return;
    }

    let finalRNTFileId =
      RNTFileRef.current?.getCurrentFileId() || values.RNTFile;
    let finalTaxFileId =
      taxFileRef.current?.getCurrentFileId() || values.taxIdEINFile;

    try {
      // 4. ELIMINACIÓN
      if (RNTFileToDelete) {
        await deleteFile(RNTFileToDelete, accessToken);
      }
      if (taxFileToDelete) {
        await deleteFile(taxFileToDelete, accessToken);
      }

      // 5. CARGA
      if (RNTFileToUpload) {
        const uploadResponse = await uploadFile(RNTFileToUpload);
        finalRNTFileId = uploadResponse.id;
      }

      if (taxFileToUpload) {
        const uploadResponse = await uploadFile(taxFileToUpload);
        finalTaxFileId = uploadResponse.id;
      }

      // 6. Validación final de IDs
      if (!finalRNTFileId) {
        alert(texts.errorRNTFileId);
        setError("RNTFile", { message: texts.alertErrorRNTFile });
        setIsSubmitting(false);
        return;
      }
      if (!finalTaxFileId) {
        alert(texts.errorTaxFileId);
        setError("taxIdEINFile", { message: texts.alertErrorTaxFile });
        setIsSubmitting(false);
        return;
      }

      // 7. Preparar y enviar los datos del proveedor con los IDs finales
      const providerData: ProviderData = {
        id: values.id,
        userId: values.userId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        country: values.country,
        state: values.state,
        city: values.city,
        description: values.description,
        membership: values.membership,
        taxIdEIN: values.taxIdEIN,
        RNTFile: finalRNTFileId,
        taxIdEINFile: finalTaxFileId,
        extraTags: values.extraTags,
        serviceTags: values.serviceTags,
        subscriptionPrice: values.subscriptionPrice || "",
        subscriptionType: values.subscriptionType || "",
        price: values.price || "",
      };

      await providerService.updateProvider(providerData.id, providerData);

      setSuccessMessage(texts.successMessage);
      router.push(`/mi-panel/mi-servicio`);
    } catch (error) {
      console.error("Error al actualizar el proveedor:", error);
      alert(texts.errorUpdateProvider);
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#39759E]" />
          <p className="text-muted-foreground">{texts.loadingData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-4">
        <h1
          className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}
        >
          {texts.pageTitle}
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">{texts.legalInfoTitle}</h2>
              <FormField
                control={form.control}
                name="taxIdEIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.taxIdLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder="Tax ID/EIN" {...field} />
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
                          ref={RNTFileRef}
                          label={texts.RNTFileLabel}
                          defaultFile={initialRNTFile}
                          onChange={handleRNTFileChange}
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
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          ref={taxFileRef}
                          label={texts.taxIdFileLabel}
                          defaultFile={initialTaxFile}
                          onChange={handleTaxFileChange}
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
                    <FormLabel>{texts.serviceNameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={texts.serviceNameLabel} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{texts.emailLabel}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={texts.emailLabel}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{texts.phoneLabel}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={texts.phoneLabel}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.descriptionLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="h-full min-h-[100px]"
                        placeholder={texts.descriptionPlaceholder}
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
                name="extraTags"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg">
                      {texts.servicesOfferedTitle}
                    </FormLabel>
                    <Controller
                      control={form.control}
                      name="extraTags"
                      render={() => (
                        <CollectionExtraTags
                          key={defaultTags.join(",")}
                          onChange={handleTagsChange}
                          extraTags={extraTags}
                          initialSelectedTags={defaultTags}
                          enable="services"
                          lang={lang}
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-4 bg-white rounded-xl">
              <h2 className="text-lg">{texts.locationTitle}</h2>
              {defaultLocation && (
                <LocationSelector
                  defaultCountry={defaultLocation.country}
                  defaultState={defaultLocation.state}
                  defaultCity={defaultLocation.city}
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
                  // Pasamos el idioma para que el selector de ubicación lo use
                  lang={lang}
                />
              )}
            </div>

            {successMessage && (
              <div
                className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded"
                role="alert"
              >
                <p className="font-bold">{texts.successTitle}</p>
                <p>{successMessage}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[#39759E] px-6 py-5 rounded-lg text-white font-medium hover:bg-[#3a5a77] transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {texts.buttonUpdating}
                </>
              ) : (
                <>
                  <Save />
                  {texts.buttonSave}
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
