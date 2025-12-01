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
import { useRouter } from "next/navigation";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"] });

import GoogleMapsSelector, {
  type LocationDetails,
} from "@/components/google-maps-selector";

import { propertyService, type PropertyData } from "@/services/propertyService";
import { uploadFile } from "@/services/fileUploadService";
import { deleteFile } from "@/services/deleteFileService";

import { MultiSelectCase } from "@/components/MultiSelectCase";

import { Building2, Home, Save } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().min(6, "El la descripción es requerida."),
  country: z.string().min(1, "Por favor selecciona un país."),
  state: z.string().min(1, "Por favor selecciona un estado."),
  city: z.string().min(1, "Por favor selecciona una ciudad."),
  postalCode: z.string(),
  address: z.string(),
  fullAddress: z
    .string()
    .min(5, "La dirección completa debe tener al menos 5 caracteres."),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  type: z.enum(["Stay", "RecoveryHouse"]),
  taxIdEIN: z.string().min(1, "El TAX ID es requerido."),
  mainImage: z.string().min(1, "La foto de la propiedad es obligatoria."),
  RNTFile: z.string(),
  taxIdEINFile: z.string(),
  hostName: z.string().min(1, "El nombre del enfitrión es obligatorio."),
  guestComments: z.string().min(1, "La información útil es obligatoria."),
  patology: z.array(z.string()).min(1, "Selecciona al menos una patología."),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones para continuar.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPropertyPage() {
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

  const router = useRouter();

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
        alert(
          "No se encontró el token de acceso. Por favor inicia sesión nuevamente."
        );
        setIsSubmitting(false);
        return;
      }

      const isRNTFileValid = RNTFileRef.current?.validate();
      const isTaxFileValid = taxFileRef.current?.validate();

      if (!isRNTFileValid) {
        form.setError("RNTFile", { message: "El archivo RNT es obligatorio" });
        setIsSubmitting(false);
        return;
      }

      if (!isTaxFileValid) {
        form.setError("taxIdEINFile", {
          message: "El archivo TAX ID es obligatorio",
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
        alert("Por favor selecciona una imagen para la propiedad");
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
        alert("Por favor carga el archivo RNT");
        setIsSubmitting(false);
        return;
      }

      if (!finalTaxFileId || finalTaxFileId === "") {
        alert("Por favor carga el archivo TAX ID");
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
        router.push(`/mi-panel/propiedades/${response.data.id}?rel=new`);
      } else {
        console.error("La respuesta no contiene un ID válido.");
      }
    } catch (error) {
      console.error("Error al registrar la propiedad:", error);
      alert("Error al registrar la propiedad. Por favor intenta de nuevo.");
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
          Registra tu propiedad
        </h1>
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
                  render={({ }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          ref={RNTFileRef}
                          label="Archivo RNT"
                          defaultFile={defaultRNTFile}
                          onChange={(file, fileIdToDelete) => {
                            setRNTFileToUpload(file);
                            setRNTFileToDelete(fileIdToDelete);
                            if (file || fileIdToDelete) {
                              form.clearErrors("RNTFile");
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
                  render={({ }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          ref={taxFileRef}
                          label="Archivo de Impuestos TAX ID"
                          defaultFile={defaultTaxFile}
                          onChange={(file, fileIdToDelete) => {
                            setTaxFileToUpload(file);
                            setTaxFileToDelete(fileIdToDelete);
                            if (file || fileIdToDelete) {
                              form.clearErrors("taxIdEINFile");
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
                      <SingleImageUploaderWithId
                        existingImageId={existingMainImageId}
                        newFile={mainImageFile}
                        onChange={handleMainImageChange}
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
                      <MultiSelectCase
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                  form.setValue("country", country);
                  form.setValue("state", state);
                  form.setValue("city", city);
                }}
                error={{
                  country: form.formState.errors.country?.message,
                  state: form.formState.errors.state?.message,
                  city: form.formState.errors.city?.message,
                }}
                lang="es"
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

              <GoogleMapsSelector
                onLocationSelected={handleLocationSelected}
                defaultLocation={defaultLocation}
                lang="es"
              />
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
                          He leído y acepto los{" "}
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#39759E] hover:text-[#3a5a77] underline font-medium"
                          >
                            Términos y Condiciones de la Plataforma
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
                  CARGANDO...
                </>
              ) : (
                <>
                  <Save />
                  REGISTRAR PROPIEDAD
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
