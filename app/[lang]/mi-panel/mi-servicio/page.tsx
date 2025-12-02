"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // ✅ Añadido useParams
import {
  getProvidersByUserId,
  type Provider,
} from "@/services/providerCollectionServiceEdit";
import { getCurrentUser } from "@/services/userService";
import { getExtraTags } from "@/services/extraTagsService";
import useTags from "@/hooks/useExtraTags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollectionExtraTagsService } from "@/components/collectionExtraTagsService";

import {
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Pencil,
  HandHelping
} from "lucide-react";
import { Fraunces } from "next/font/google";

// Tipos de idioma (asumo que existe este path)
import { type Locale } from "@/lib/i18n"; 

const fraunces = Fraunces({ subsets: ["latin"] });


// ===============================================================
// 📚 Objeto de Traducciones
// ===============================================================

type TranslationText = {
  pageTitle: string;
  loadingMessage: string;
  errorLoadingData: string;
  noServiceTitle: string;
  noServiceText: string;
  registerButton: string;
  taxIdLabel: string;
  approvedBadge: string;
  inReviewBadge: string;
  phoneLabel: string;
  locationLabel: string;
  RNTLabel: string;
  notUploaded: string;
  amenitiesTitle: string;
  editButton: string;
  dialogTitle: string;
  dialogDescription: string;
  dialogCancel: string;
  dialogDelete: string;
};

const translations: Record<string, TranslationText> = {
  es: {
    pageTitle: "Mi Servicio",
    loadingMessage: "Cargando...",
    errorLoadingData: "Error al cargar los datos del proveedor. Por favor, intente de nuevo más tarde.",
    noServiceTitle: "Aún no has registrado ningún servicio",
    noServiceText: "Registra tu servicio para pacientes y comienza a recibir reservas.",
    registerButton: "Registrar mi Servicio",
    taxIdLabel: "Tax ID/EIN",
    approvedBadge: "Aprobado",
    inReviewBadge: "En Revisión",
    phoneLabel: "Teléfono",
    locationLabel: "Ubicación",
    RNTLabel: "RNT",
    notUploaded: "No cargado",
    amenitiesTitle: "Servicios",
    editButton: "Editar",
    dialogTitle: "¿Eliminar servicio?",
    dialogDescription: "Esta acción eliminará permanentemente tu servicio y cancelará cualquier suscripción activa. Esta acción no se puede deshacer.",
    dialogCancel: "Cancelar",
    dialogDelete: "Eliminar servicio",
  },
  en: {
    pageTitle: "My Service",
    loadingMessage: "Loading...",
    errorLoadingData: "Error loading provider data. Please try again later.",
    noServiceTitle: "You haven't registered any service yet",
    noServiceText: "Register your service for patients and start receiving bookings.",
    registerButton: "Register My Service",
    taxIdLabel: "Tax ID/EIN",
    approvedBadge: "Approved",
    inReviewBadge: "In Review",
    phoneLabel: "Phone",
    locationLabel: "Location",
    RNTLabel: "RNT",
    notUploaded: "Not uploaded",
    amenitiesTitle: "Services",
    editButton: "Edit",
    dialogTitle: "Delete service?",
    dialogDescription: "This action will permanently delete your service and cancel any active subscription. This action cannot be undone.",
    dialogCancel: "Cancel",
    dialogDelete: "Delete service",
  },
};


export default function ProviderDataPage() {
  const router = useRouter();
  
  // 🌐 Lógica de Idioma
  const params = useParams();
  const lang = (params.lang as Locale) || "es";
  const texts = translations[lang as keyof typeof translations] || translations.en;
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  const { extraTags } = useTags("extraTags", getExtraTags);
  console.log(extraTags);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push(`/${lang}/login`)
        return;
      }

      try {
        setLoading(true);
        const currentUser = await getCurrentUser(token);

        const data = await getProvidersByUserId(currentUser.id, token);
        setProviders(data);
      } catch (error) {
        console.error("Error al cargar los datos del proveedor:", error);
        setError(texts.errorLoadingData); // 👈 Traducido
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router, texts]); // Dependencia de 'texts' para el mensaje de error de carga

  {
    /* const handleDeleteService = (providerId: string) => {
    setProviderToDelete(providerId)
    setShowDeleteDialog(true)
  }*/
  }

  const confirmDelete = async () => {
    if (!providerToDelete) return;

    try {
      // TODO: Implement actual delete API call
      console.log("Deleting provider:", providerToDelete);
      // After successful deletion, refresh the providers list
      setShowDeleteDialog(false);
      setProviderToDelete(null);
      // Refresh data
      const token = localStorage.getItem("access_token");
      if (token) {
        const currentUser = await getCurrentUser(token);
        const data = await getProvidersByUserId(currentUser.id, token);
        setProviders(data);
      }
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {texts.loadingMessage} {/* 👈 Traducido */}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (providers.length === 0) {
    return (
      <div className="container min-h-screen mx-auto p-4 py-16">
        <div className="max-w-xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-16">
            <div className="w-20 h-20 rounded-full bg-[#39759E]/10 flex items-center justify-center">
              <HandHelping className="w-10 h-10 text-[#39759E]" />
            </div>

            <div className="space-y-3">
              
              <h1
            className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-8`}
          >
             {texts.noServiceTitle} {/* 👈 Traducido */}
          </h1>
              <p className="text-base text-gray-600 max-w-md mx-auto">
                {texts.noServiceText} {/* 👈 Traducido */}
              </p>
            </div>

            <Button
              size="lg"
              className="mt-4 px-8 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#39759E" }}
              onClick={() => router.push("/mi-panel/registrar-servicio")}
            >
              {texts.registerButton} {/* 👈 Traducido */}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen mx-auto py-4">
      <h1
        className={`${fraunces.className} text-3xl font-normal text-[#162F40] mb-4`}
      >
        {texts.pageTitle} {/* 👈 Traducido */}
      </h1>
      <div className="space-y-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="overflow-hidden border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle
                    className={`${fraunces.className} text-2xl font-normal text-[#162F40] mb-4`}
                  >
                    {provider.name}
                  </CardTitle>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{provider.email}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-6">{provider.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    {texts.taxIdLabel} {/* 👈 Traducido */}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {provider.taxIdEIN}
                  </p>
                  {provider.taxIdApproved ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {texts.approvedBadge} {/* 👈 Traducido */}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-800 border-orange-300"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {texts.inReviewBadge} {/* 👈 Traducido */}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {texts.phoneLabel} {/* 👈 Traducido */}
                    </p>
                    <div className="flex items-center text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{provider.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {texts.locationLabel} {/* 👈 Traducido */}
                  </p>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{`${provider.city}, ${provider.state}, ${provider.country}`}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row flex-wrap gap-4">
                <div className="flex items-center flex-1 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{texts.RNTLabel}</p> {/* 👈 Traducido */}
                    {provider.RNTFile ? (
                      <a
                        href={`/webapi/assets/${provider.RNTFile.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-800 hover:underline"
                      >
                        {provider.RNTFile.filename_download}
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500">{texts.notUploaded}</p> 
                    )}
                  </div>
                </div>

                <div className="flex items-center flex-1 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {texts.taxIdLabel} {/* 👈 Traducido */}
                    </p>
                    {provider.taxIdEINFile ? (
                      <a
                        href={`/webapi/assets/${provider.taxIdEINFile.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-800 hover:underline"
                      >
                        {provider.taxIdEINFile.filename_download}
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500">{texts.notUploaded}</p> 
                    )}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {Array.isArray(provider?.extraTags) &&
                provider.extraTags.length > 0 && (
                  <div className="mt-8 mb-8">
                    <h2
                      className={`${fraunces.className} text-xl font-normal text-[#162F40] mb-4`}
                    >
                      {texts.amenitiesTitle} {/* 👈 Traducido */}
                    </h2>
                    <CollectionExtraTagsService
                      extraTags={extraTags}
                      enable="services"
                      roomTags={provider.extraTags}
                      lang={lang}
                    />
                  </div>
                )}

              <div className="flex justify-end mt-8 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/mi-panel/editar-servicio")}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {texts.editButton} {/* 👈 Traducido */}
                </Button>
                {/*<Button variant="destructive" size="sm" onClick={() => handleDeleteService(provider.id)}>
                    <Trash2 className="h-4 w-4" />
                    
                  </Button>*/}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.dialogTitle}</DialogTitle> {/* 👈 Traducido */}
            <DialogDescription>
              {texts.dialogDescription} {/* 👈 Traducido */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {texts.dialogCancel} {/* 👈 Traducido */}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {texts.dialogDelete} {/* 👈 Traducido */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}