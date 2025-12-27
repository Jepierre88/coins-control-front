"use client";

import CoinsCard, {
  CoinsCardContent,
  CoinsCardDescription,
  CoinsCardHeader,
} from "@/components/coins/coins-card.component";
import CoinsButton from "@/components/coins/coins-button.component";
import CoinsForm, { CoinsFormField } from "@/components/coins/coins-form.component";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginSchema,
  LoginSchemaType,
} from "@/core/forms/schemas/login-schema";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginSchemaType>({
    defaultValues: {
      identificationNumber: "",
      password: "",
    },
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginSchemaType) {
    console.log("Submitting login form with data:", data);
    try {
      await authClient.$fetch("/credentials/sign-in", {
        method: "POST",
        body: data,
      });

      toast.success("Bienvenido");
      router.push("/");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login fallido";
      toast.error(message);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <CoinsCard>
          <CoinsCardHeader title="Iniciar sesión">
            <CoinsCardDescription>
              Ingresa tu identificación y contraseña.
            </CoinsCardDescription>
          </CoinsCardHeader>

          <CoinsCardContent>
            <CoinsForm form={form} onSubmit={onSubmit} className="grid gap-4">
              <CoinsFormField
                form={form}
                name="identificationNumber"
                label="Identificación"
                inputProps={{
                  autoComplete: "username",
                  placeholder: "Ej: 123456789",
                }}
              />

              <CoinsFormField
                form={form}
                name="password"
                label="Contraseña"
                inputProps={{
                  type: "password",
                  autoComplete: "current-password",
                  placeholder: "••••••••",
                }}
              />

              <CoinsButton
                type="submit"
                isDisabled={form.formState.isSubmitting}
                isLoading={form.formState.isSubmitting}
              >
                Entrar
              </CoinsButton>
            </CoinsForm>
          </CoinsCardContent>
        </CoinsCard>
      </div>
    </main>
  );
}
