"use client";

import Link from "next/link";

import CoinsCard, {
  CoinsCardContent,
  CoinsCardDescription,
  CoinsCardHeader,
} from "@/components/coins/coins-card.component";
import CoinsButton from "@/components/coins/coins-button.component";
import CoinsForm, { CoinsFormField } from "@/components/coins/coins-form.component";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginSchemaType } from "@/core/forms/schemas/login-schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { handleLogin } from "@/lib/auth-utils";
import { ActionResponseEntity } from "@/types/action-response.entity";

export default function LoginClient() {
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
        <div className="mb-4 text-center">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Accede a Coins Control</h1>
          <p className="mt-1 text-sm text-muted-fg">
            Entra para gestionar accesos, agendamientos y operación.
          </p>
        </div>

        <CoinsCard>
          <CoinsCardHeader title="Iniciar sesión">
            <CoinsCardDescription>Ingresa tu identificación y contraseña.</CoinsCardDescription>
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

        <div className="mt-4 text-center text-xs text-muted-fg">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Volver al inicio
            </Link>
            <span aria-hidden="true">·</span>
            <span>¿Necesitas ayuda? Contacta al administrador.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
