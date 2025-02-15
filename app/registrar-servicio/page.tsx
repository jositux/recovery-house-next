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
import { LocationSelector } from "@/components/ui/location-selector";
import { providerService, ProviderData } from "@/services/providerService";
//import { MembershipSelector } from "@/components/ui/membership-selector";
/*import {
  getMembershipTags,
  type MembershipTag,
} from "@/services/membership-service";*/
import { CollectionExtraTags } from "@/components/collectionExtraTags";
//import { CollectionServiceTags } from "@/components/collectionServiceTags";
import { getExtraTags } from "@/services/extraTagsService";
//import { getServiceTags } from "@/services/serviceTagsService";

const formSchema = z.object({
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
  // Nuevos campos de suscripción
  subscriptionPrice: z.string().default(""),
  subscriptionType: z.string().default(""),
  price: z.string().default(""),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPropertyBasePage() {
  const [extraTags, setExtraTags] = useState<
    { id: string; name: string; icon: string; enable_property: boolean; enable_services: boolean; }[]
  >([]);
  /*const [servicesTags, setServicesTags] = useState<
    { id: string; name: string; icon: string; }[]
  >([]);
  const [selectedMembership, setSelectedMembership] = useState<string | null>(
    null
  );*/
  //const [memberships, setMemberships] = useState<MembershipTag[]>([]);

 /* useEffect(() => {
    const fetchMemberships = async () => {
      const data = await getMembershipTags();
      setMemberships(data);
    };
    fetchMemberships();
  }, []);*/

 /*const handleSelectionChange = (selectedId: string | null) => {
    setSelectedMembership(selectedId);
    console.log("Selected membership ID:", selectedId);
  };*/

  useEffect(() => {
    const loadTags = async () => {
      try {
        const extraTagsData = await getExtraTags();
        setExtraTags(extraTagsData);

        //const servicesTagsData = await getServiceTags();
       // setServicesTags(servicesTagsData);
      } catch (error) {
        console.error(error);
      }
    };
    loadTags();
  }, []);

  const [RNTFileData, setRNTFileData] = useState<{
    id: string;
    filename_download: string;
  }>({ id: "", filename_download: "" });

  const [TaxFileData, setTaxFileData] = useState<{
    id: string;
    filename_download: string;
  }>({ id: "", filename_download: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      description: "",
      membership: "bronze",
      taxIdEIN: "",
      RNTFile: "",
      taxIdEINFile: "",
      extraTags: [],
      serviceTags: [],
    },
  });

  const { setValue } = form;

  const handleTagsChange = (tags: string[]) => {
    if (JSON.stringify(tags) !== JSON.stringify(selectedExtraTags)) {
      setValue("extraTags", tags, { shouldDirty: true });
    }
  };

  useEffect(() => {
    const subscriptionData = localStorage.getItem("subscription")
    if (subscriptionData) {
      const { subscriptionPrice, subscriptionType, price } = JSON.parse(subscriptionData)
      form.setValue("subscriptionPrice", subscriptionPrice)
      form.setValue("subscriptionType", subscriptionType)
      form.setValue("price", price)
    }
  }, [])

  const selectedExtraTags = useWatch({
    control: form.control,
    name: "extraTags",
  });

 /* const selectedServiceTags = useWatch({
    control: form.control,
    name: "serviceTags",
  });*/

  const onSubmit = async (values: FormValues) => {
    if (!values.RNTFile || !values.taxIdEINFile) {
      console.error("Faltan archivos obligatorios.");
      return;
    }

    setIsSubmitting(true);
    try {
      const providerData: ProviderData = {
        userId: "",
        name: values.name,
        email: values.email,
        phone: values.phone,
        country: values.country,
        state: values.state,
        city: values.city,
        description: values.description,
        membership: "bronze",
        taxIdEIN: values.taxIdEIN,
        RNTFile: values.RNTFile,
        taxIdEINFile: values.taxIdEINFile,
        extraTags: values.extraTags,
        serviceTags: values.serviceTags,
        subscriptionPrice: values.subscriptionPrice || "",
        subscriptionType: values.subscriptionType || "",
        price: values.price || "",
      };
      const response = await providerService.createProperty(providerData);

      console.log("Servicio creado:", response);
    } catch (error) {
      console.error("Error al registrar el servicio:", error);
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
  };

  const handleTaxFileUpload = (response: {
    id: string;
    filename_download: string;
  }) => {
    setTaxFileData(response);
    form.setValue("taxIdEINFile", response.id);
    form.clearErrors("taxIdEINFile");
  };

  const handleRNTFileClear = () => {
    setRNTFileData({ id: "", filename_download: "" });
    form.setValue("RNTFile", "");
  };

  const handleTaxFileClear = () => {
    setTaxFileData({ id: "", filename_download: "" });
    form.setValue("taxIdEINFile", "");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="container mx-auto max-w-2xl py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Registra tu servicio
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4 p-4 bg-white rounded-xl">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Servicio</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Peluquería Pedrito" {...field} />
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
                    <Input type="email" placeholder="Correo electrónico" {...field} />
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
                    <Input type="text" placeholder="Número de teléfono" {...field} />
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
                <FormControl>
                  <Textarea placeholder="Describe las características" {...field} />
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
                <FormLabel className="text-lg">Servicios Ofrecidos</FormLabel>
                <Controller
                  control={form.control}
                  name="extraTags"
                  render={() => (
                    <CollectionExtraTags
                      onChange={handleTagsChange}
                      extraTags={extraTags}
                      initialSelectedTags={selectedExtraTags}
                      enable="services"
                    />
                  )}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          </div>
          <div className="space-y-4 p-4 bg-white rounded-xl">
<h2 className="text-lg">Dónde ofrece su servicio?</h2>
<LocationSelector
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
{/*
          <FormField
            control={form.control}
            name="membership"
            render={() => (
              <FormItem>
                <FormLabel>Membresía</FormLabel>
                <FormControl>
                  <MembershipSelector
                    memberships={memberships}
                    onSelectionChange={handleSelectionChange}
                    defaultSelectedId="bronze"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />*/}
            </div>
            <div className="space-y-4 p-4 bg-white rounded-xl">
            <h2 className="text-lg">Información Legal</h2>
          <FormField
            control={form.control}
            name="taxIdEIN"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID/EIN</FormLabel>
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
                  <FormLabel>RNT File</FormLabel>
                  <FormControl>
                    <FileUpload
                      id={RNTFileData.id}
                      filename_download={RNTFileData.filename_download}
                      onUploadSuccess={handleRNTFileUpload}
                      onClearFile={handleRNTFileClear}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxIdEINFile"
              render={() => (
                <FormItem>
                  <FormLabel>TAX ID File</FormLabel>
                  <FormControl>
                    <FileUpload
                      id={TaxFileData.id}
                      filename_download={TaxFileData.filename_download}
                      onUploadSuccess={handleTaxFileUpload}
                      onClearFile={handleTaxFileClear}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            </div>
          </div>
         
          {/*<FormField
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
                      onChange={handleServiceTagsChange}
                      servicesTags={servicesTags}
                      initialSelectedTags={selectedServiceTags}
                    />
                  )}
                />
                <FormMessage />
              </FormItem>
            )}
                  />*/}
          <Button type="submit" className="w-full bg-[#39759E]" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar Proveedor"}
          </Button>
        </form>
      </Form>
    </div>
    </div>
  );
}
