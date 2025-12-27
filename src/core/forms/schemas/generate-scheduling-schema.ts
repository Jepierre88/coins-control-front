import z from "zod";

export const GenerateSchedulingSchema = z.object({
  apartmentId: z.string().min(1, "Selecciona un apartamento"),
  identificationNumber: z.string().min(1, "Documento requerido"),
  name: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  email: z.string().min(1, "Correo requerido").email("Correo inválido"),
  cellPhoneNumber: z.string().optional(),
  startLocal: z.string().min(1, "Check-in requerido"),
  endLocal: z.string().min(1, "Check-out requerido"),
});

export type GenerateSchedulingSchemaType = z.infer<typeof GenerateSchedulingSchema>;
