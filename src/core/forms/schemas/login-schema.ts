import z from "zod";

export const LoginSchema = z.object({
  identificationNumber: z
    .string(),
    password: z.string().min(8, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;