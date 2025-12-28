"use client";

import CoinsCard, {
  CoinsCardContent,
  CoinsCardDescription,
  CoinsCardHeader,
} from "@/components/coins/coins-card.component";
import CoinsButton from "@/components/coins/coins-button.component";
import CoinsForm, {
  CoinsFormField,
} from "@/components/coins/coins-form.component";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginSchema,
  LoginSchemaType,
} from "@/core/forms/schemas/login-schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { handleLogin } from "@/lib/auth-utils";
import { ActionResponseEntity } from "@/types/action-response.entity";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<LoginSchemaType>({
    defaultValues: {
      identificationNumber: "",
      password: "",
    },
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginSchemaType) {
    try {
      const res = await handleLogin({
        identificationNumber: data.identificationNumber,
        password: data.password,
      });

      toast.success(res.message);

      const next = searchParams.get("next");
      const safeNext = next && next.startsWith("/") ? next : "/admin";

      // Forzar navegación dura para asegurar cookies/sesión actualizadas en toda la app
      router.push(safeNext);
      router.refresh();
      window.location.assign(safeNext);
    } catch (error: unknown) {
      const actionError = error as ActionResponseEntity<unknown>;
      toast.error(actionError?.message || "Error al iniciar sesión");
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
                  required: true,
                  autoComplete: "username",
                  placeholder: "Ej: 123456789",
                }}
              />

              <CoinsFormField
                form={form}
                name="password"
                label="Contraseña"
                inputProps={{
                  required: true,
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
