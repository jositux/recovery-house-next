"use client";

import { useState, useEffect } from "react";
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
import FileUpload from "@/components/FileUpload";
import {
  providerService,
  ProviderData,
} from "@/services/providerUpdateService";
import { MembershipSelector } from "@/components/ui/membership-selector";
import { LocationSelector } from "@/components/ui/location-selector";
import {
  getMembershipTags,
  type MembershipTag,
} from "@/services/membership-service";
import { CollectionExtraTags } from "@/components/collectionExtraTags";
import { CollectionServiceTags } from "@/components/collectionServiceTags";
import { getProvidersByUserId } from "@/services/providerCollectionService";
import { getExtraTags } from "@/services/extraTagsService";
import { getServiceTags } from "@/services/serviceTagsService";
import { getCurrentUser } from "@/services/userService";

const formSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Debe ser un email válido."),
  phone: z.string().min(1, "El teléfono es requerido."),
  country: z.string().min(1, "Por favor selecciona un país."),
  state: z.string().min(1, "Por favor selecciona un estado."),
  city: z.string().min(1, "Por favor selecciona una ciudad."),
  membership: z.string(),
  description: z.string().min(6, "La descripción es requerida."),
  taxIdEIN: z.string().min(1, "El TAX ID es requerido."),
  RNTFile: z.string().refine((val) => val.length > 0, {
    message: "El archivo RNT es obligatorio.",
  }),
  taxIdEINFile: z.string().refine((val) => val.length > 0, {
    message: "El archivo TAX ID es obligatorio.",
  }),
  extraTags: z.array(z.string()).default([]),
  serviceTags: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPropertyBasePage() {
  const [extraTags, setExtraTags] = useState<
    { id: string; name: string; icon: string }[]
  >([]);
  const [servicesTags, setServicesTags] = useState<
    { id: string; name: string; icon: string }[]
  >([]);
  const [selectedMembership, setSelectedMembership] = useState<string>("");
  const [memberships, setMemberships] = useState<MembershipTag[]>([]);
  const [defaultTags, setDefaultTags] = useState<string[]>([]);
  const [defaultServiceTags, setDefaultServiceTags] = useState<string[]>([]);

  const [defaultLocation, setDefaultLocation] = useState<{
    country: string;
    state: string;
    city: string;
  } | null>(null);

  const [RNTFileData, setRNTFileData] = useState<{
    id: string;
    filename_download: string;
  } | null>(null);

  const [TaxFileData, setTaxFileData] = useState<{
    id: string;
    filename_download: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const { setValue } = form;

  useEffect(() => {
    const fetchMemberships = async () => {
      const data = await getMembershipTags();
      setMemberships(data);
    };
    fetchMemberships();
  }, []);

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
            name: provider.name,
            email: provider.email,
            phone: provider.phone,
            country: provider.country,
            state: provider.state,
            city: provider.city,
            description: provider.description,
            membership: provider.membership,
            taxIdEIN: provider.taxIdEIN,
            taxIdEINFile: provider.taxIdEINFile?.id || "",
            RNTFile: provider.RNTFile?.id || "",
            extraTags: provider.extraTags,
            serviceTags: provider.serviceTags,
          });

          setRNTFileData({
            id: provider.RNTFile?.id || "",
            filename_download: provider.RNTFile?.filename_download || "",
          });

          setTaxFileData({
            id: provider.taxIdEINFile?.id || "",
            filename_download: provider.taxIdEINFile?.filename_download || "",
          });

          setDefaultLocation({
            country: provider.country,
            state: provider.state,
            city: provider.city,
          });

          setSelectedMembership(provider.membership);
          setDefaultTags(provider.extraTags || []);
          setDefaultServiceTags(provider.serviceTags || []);
        }
      } catch (error) {
        console.error("Error al cargar los datos del proveedor:", error);
      }
    };

    fetchProviderData();
  }, [form]);

  useEffect(() => {
    console.log("defaultTags:", defaultTags);
    console.log("defaultServiceTags:", defaultServiceTags);
  }, [defaultTags, defaultServiceTags]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const extraTagsData = await getExtraTags();
        setExtraTags(extraTagsData);

        const servicesTagsData = await getServiceTags();
        setServicesTags(servicesTagsData);
      } catch (error) {
        console.error(error);
      }
    };
    loadTags();
  }, []);

  const handleSelectionChange = (selectedId: string) => {
    setSelectedMembership(selectedId);
  };

  const handleTagsChange = (tags: string[]) => {
    if (JSON.stringify(tags) !== JSON.stringify(selectedExtraTags)) {
      setValue("extraTags", tags, { shouldDirty: true });
    }
  };

  const handleServiceTagsChange = (tags: string[]) => {
    if (JSON.stringify(tags) !== JSON.stringify(selectedServiceTags)) {
      setValue("serviceTags", tags, { shouldDirty: true });
    }
  };

  const selectedExtraTags = useWatch({
    control: form.control,
    name: "extraTags",
  });

  const selectedServiceTags = useWatch({
    control: form.control,
    name: "serviceTags",
  });

  const onSubmit = async (values: FormValues) => {
    console.log("Form values before submission:", values);
    if (!values.RNTFile || !values.taxIdEINFile) {
      console.error("Faltan archivos obligatorios.");
      return;
    }

    setIsSubmitting(true);
    try {
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
        membership: selectedMembership || values.membership,
        taxIdEIN: values.taxIdEIN,
        RNTFile: values.RNTFile,
        taxIdEINFile: values.taxIdEINFile,
        extraTags: values.extraTags,
        serviceTags: values.serviceTags,
      };

      const response = await providerService.updateProvider(
        providerData.id,
        providerData
      );

      console.log("Provider updated:", response);
      setSuccessMessage("¡Proveedor actualizado con éxito!");
    } catch (error) {
      console.error("Error al actualizar el proveedor:", error);
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRNTFileUpload = (response: {
    id: string;
    filename_download: string;
  }) => {
    setRNTFileData(response);
    form.setValue("RNTFile", response.id);
    form.clearErrors("RNTFile");
    console.log("RNTFile updated:", response.id);
  };

  const handleTaxFileUpload = (response: {
    id: string;
    filename_download: string;
  }) => {
    setTaxFileData(response);
    form.setValue("taxIdEINFile", response.id);
    form.clearErrors("taxIdEINFile");
    console.log("taxIdEINFile updated:", response.id);
  };

  const handleRNTFileClear = () => {
    setRNTFileData(null);
    form.setValue("RNTFile", "");
  };

  const handleTaxFileClear = () => {
    setTaxFileData(null);
    form.setValue("taxIdEINFile", "");
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">
        Actualizar información del proveedor
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del proveedor</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Correo electrónico"
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
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Número de teléfono"
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
                <FormLabel>Describe el servicio que ofreces</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe las características"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            />
          )}
          <FormField
            control={form.control}
            name="membership"
            render={() => (
              <FormItem>
                <FormLabel>Tipo de Membresía</FormLabel>
                <FormControl>
                  <MembershipSelector
                    memberships={memberships}
                    onSelectionChange={handleSelectionChange}
                    defaultSelectedId={selectedMembership}
                  />
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
                <FormLabel>Número de impuestos ID/EIN</FormLabel>
                <FormControl>
                  <Input placeholder="Tax ID/EIN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RNTFileData !== null && (
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
                        onUploadSuccess={handleRNTFileUpload}
                        onClearFile={handleRNTFileClear}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {TaxFileData !== null && (
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
                        onUploadSuccess={handleTaxFileUpload}
                        onClearFile={handleTaxFileClear}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
         
          {defaultServiceTags && (
            <FormField
              control={form.control}
              name="serviceTags"
              render={() => (
                <FormItem>
                  <FormLabel>Etiquetas de Servicio</FormLabel>
                  <Controller
                    control={form.control}
                    name="serviceTags"
                    render={() => (
                      <CollectionServiceTags
                        key={defaultServiceTags.join(',')}
                        onChange={handleServiceTagsChange}
                        servicesTags={servicesTags}
                        initialSelectedTags={defaultServiceTags}
                      />
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

{defaultTags && (
            <FormField
              control={form.control}
              name="extraTags"
              render={() => (
                <FormItem>
                  <FormLabel>Etiquetas Extra</FormLabel>
                  <Controller
                    control={form.control}
                    name="extraTags"
                    render={() => (
                      <CollectionExtraTags
                        key={defaultTags.join(',')}
                        onChange={handleTagsChange}
                        extraTags={extraTags}
                        initialSelectedTags={defaultTags}
                      />
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">¡Éxito!</p>
              <p>{successMessage}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Actualizando..." : "Actualizar Proveedor"}
          </Button>
        </form>
      </Form>
    </div>
  );
}