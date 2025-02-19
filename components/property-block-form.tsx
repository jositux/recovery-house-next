"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const formSchema = z
  .object({
    isBlocked: z.boolean(),
    fromDate: z.date().optional(),
    toDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.isBlocked) {
        return data.fromDate && data.toDate && data.toDate > data.fromDate;
      }
      return true;
    },
    {
      message: "La fecha 'Hasta' debe ser posterior a la fecha 'Desde'",
      path: ["toDate"],
    }
  );

export function PropertyBlockForm() {
  const [isBlocked, setIsBlocked] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isBlocked: false,
      fromDate: undefined,
      toDate: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { isBlocked, fromDate, toDate } = values;
    if (isBlocked && fromDate && toDate) {
      console.log("Propiedad bloqueada desde", fromDate, "hasta", toDate);
    } else if (isBlocked) {
      console.log("Error: Fechas no seleccionadas correctamente");
    } else {
      console.log("Propiedad no bloqueada");
    }
    // Aquí iría la lógica para enviar los datos al servidor
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 rounded-lg border p-4 m4"
      >
        <FormField
          control={form.control}
          name="isBlocked"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Bloquear Habitación</FormLabel>
                <FormDescription className="mr-4">
                  Activa la opción y Elige un rango de fechas. La habitación se
                  ocultará en ese período.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsBlocked(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {isBlocked && (
          <div className="grid grid-cols-1 grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fromDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal text-[13px]",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "d MMM, yyyy", { locale: es })
                          ) : (
                            <span>Desde</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const toDate = form.getValues("toDate");
                          return (
                            date < new Date() ||
                            (toDate ? date > toDate : false)
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal text-[13px]",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "d MMM, yyyy", { locale: es })
                          ) : (
                            <span>Hasta</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const fromDate = form.getValues("fromDate");
                          return (
                            date < new Date() ||
                            (fromDate ? date < fromDate : false)
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {isBlocked && (
          <div className="flex justify-end">
            <Button type="submit" className="bg-[#D11A2A]">
              Bloquear
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
