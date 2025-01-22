import * as z from "zod";

export const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().min(6, "La descripción es requerida."),
  country: z.string().min(1, "Por favor selecciona un país."),
  state: z.string().min(1, "Por favor selecciona un estado."),
  city: z.string().min(1, "Por favor selecciona una ciudad."),
  postalCode: z.string().min(1, "El código postal es requerido."),
  street: z.string().min(1, "La calle es requerida."),
  number: z.string().min(1, "El número es requerido."),
  fullAddress: z.string().min(5, "La dirección completa debe tener al menos 5 caracteres."),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  type: z.enum(["Stay", "RecoveryHouse"]),
  taxIdEIN: z.string().min(1, "El TAX ID es requerido."),
  mainImage: z.string().min(1, "La foto de la propiedad es obligatoria."),
  RNTFile: z.string().min(1, "El archivo RNT es obligatorio."),
  taxIdEINFile: z.string().min(1, "El archivo TAX ID es obligatorio."),
});

export type FormValues = z.infer<typeof formSchema>;

export interface FileData {
  id: string;
  filename_download: string;
}

export interface Room {
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
}

export interface Property extends Omit<FormValues, 'RNTFile' | 'taxIdEINFile'> {
  userId: string;
  region: string;
  place: {
    type: string;
    coordinates: [number, number];
  };
  taxIdApproved: boolean;
  Rooms: Room[];
  RNTFile: FileData;
  taxIdEINFile: FileData;
}