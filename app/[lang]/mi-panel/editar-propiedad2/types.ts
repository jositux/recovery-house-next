import * as z from "zod";

export const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().min(6, "La descripción es requerida."),
  country: z.string().min(1, "Por favor selecciona un país."),
  state: z.string().min(1, "Por favor selecciona un estado."),
  city: z.string().min(1, "Por favor selecciona una ciudad."),
  postalCode: z.string().min(1, "El código postal es requerido."),
  address: z.string(),
  fullAddress: z.string().min(5, "La dirección completa debe tener al menos 5 caracteres."),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  type: z.enum(["Stay", "RecoveryHouse"]),
  taxIdEIN: z.string().min(1, "El TAX ID es requerido."),
  mainImage: z.string().min(1, "La foto de la propiedad es obligatoria."),
  RNTFile: z.string().min(1, "El archivo RNT es obligatorio."),
  taxIdEINFile: z.string().min(1, "El archivo TAX ID es obligatorio."),
  hostName: z.string().min(1, "El Hostname"),
  guestComments: z.string().min(1, "El comentario es Obligatorio"),
  patology: z.array(z.string()).min(1, "Selecciona al menos una patología."),
});

export type FormValues = z.infer<typeof formSchema>;

export interface FileData {
  id: string;
  filename_download: string;
}

interface Image {
  id: string
  isModerated: boolean
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
  photos: string[];
  extraTags: string[]; // Aquí es un array de cadenas
  servicesTags: string[];
  propertyId: string;
}

export interface RoomSkeleton {
  id: string;
  name: string;
  roomNumber: string;
  description: string;
  beds: number;
  capacity: number;
  pricePerNight: string;
  cleaningFee: string;
  mainImage: string;
  photos: { directus_files_id: { id: string } }[]; // Asumido formato
  extraTags: { ExtraTags_id: string }[]; // Aquí es un array de objetos con la propiedad `ExtraTags_id`
  servicesTags: { serviceTags_id: string }[]; // Similar a `extraTags`
  propertyId: string;
}


export interface Property extends Omit<FormValues, 'RNTFile' | 'taxIdEINFile' | 'mainImage' > {
  userId: string;
  region: string;
  place: {
    type: string;
    coordinates: [number, number];
  };
  taxIdApproved: boolean;
  Rooms: RoomSkeleton[];
  RNTFile: FileData;
  taxIdEINFile: FileData;
  mainImage: Image;
}