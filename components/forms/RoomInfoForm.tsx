"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"

const roomInfoSchema = z.object({
  photo: z.object({
    id: z.string(),
    filename: z.string(),
    url: z.string()
  }).optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  beds: z.string().min(1, "Requerido"),
  capacity: z.string().min(1, "Requerido"),
})

const formSchema = z.object({
  rooms: z.array(roomInfoSchema)
})

export type RoomInfoFormValues = z.infer<typeof formSchema>

interface RoomInfoFormProps {
  numberOfRooms: number
  onSubmit: (values: RoomInfoFormValues) => void
}

export function RoomInfoForm({ numberOfRooms, onSubmit }: RoomInfoFormProps) {
  const form = useForm<RoomInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rooms: Array(numberOfRooms).fill({ photo: undefined, description: "", beds: "", capacity: "" })
    },
  })

  const handleImageChange = (index: number, fileData: { id: string; filename: string; url: string; } | undefined) => {
    form.setValue(`rooms.${index}.photo`, fileData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {Array.from({ length: numberOfRooms }).map((_, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">Habitación {index + 1}</h3>
            <FormField
              control={form.control}
              name={`rooms.${index}.photo`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto de la habitación</FormLabel>
                  <FormControl>
                    <ImageUpload
                      onChange={(fileData) => handleImageChange(index, fileData)}
                      onRemove={() => handleImageChange(index, undefined)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Sube una foto para la habitación. Máximo 5MB, formatos .jpg, .png o .webp.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`rooms.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe las características de la habitación"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`rooms.${index}.beds`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de camas</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="Ej: 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`rooms.${index}.capacity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad (personas)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="Ej: 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Atrás
          </Button>
          <Button type="submit">Enviar</Button>
        </div>
      </form>
    </Form>
  )
}

