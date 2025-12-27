"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import CoinsButton from "@/components/coins/coins-button.component"
import CoinsForm, { CoinsFormField } from "@/components/coins/coins-form.component"
import CoinsLabel from "@/components/coins/coins-label.component"
import CoinsSelect from "@/components/coins/coins-select.component"
import { UseDialogContext } from "@/context/dialog.context"
import {
  generateApartmentScheduling,
  type ApartmentListItem,
} from "@/datasource/coins-control.datasource"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import {
  GenerateSchedulingSchema,
  type GenerateSchedulingSchemaType,
} from "@/core/forms/schemas/generate-scheduling-schema"

type Props = {
  buildingId: string | number
  apartments: ApartmentListItem[]
  externalToken?: string
  createdBy?: string
}

function toDatetimeLocal(date: Date) {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16)
}

export default function GenerateSchedulingDialog({
  buildingId,
  apartments,
  externalToken,
  createdBy,
}: Props) {
  const router = useRouter()
  const { closeDialog } = UseDialogContext()

  const defaultStart = React.useMemo(() => toDatetimeLocal(new Date(Date.now() + 60_000)), [])
  const defaultEnd = React.useMemo(() => toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60_000)), [])

  const firstApartmentId = React.useMemo(() => {
    const id = apartments?.[0]?.id
    return id ? String(id) : ""
  }, [apartments])

  const form = useForm<GenerateSchedulingSchemaType>({
    defaultValues: {
      apartmentId: firstApartmentId,
      identificationNumber: "",
      name: "",
      lastName: "",
      email: "",
      cellPhoneNumber: "",
      startLocal: defaultStart,
      endLocal: defaultEnd,
    },
    resolver: zodResolver(GenerateSchedulingSchema),
    mode: "onChange",
  })

  async function onSubmit(values: GenerateSchedulingSchemaType) {
    form.clearErrors(["startLocal", "endLocal"])

    const start = new Date(values.startLocal)
    const end = new Date(values.endLocal)

    if (!Number.isFinite(start.getTime())) {
      form.setError("startLocal", { message: "Fecha/hora inválida" })
      return
    }

    if (!Number.isFinite(end.getTime())) {
      form.setError("endLocal", { message: "Fecha/hora inválida" })
      return
    }

    if (start.getTime() <= Date.now()) {
      form.setError("startLocal", { message: "Debe ser posterior a la hora actual" })
      return
    }

    if (end.getTime() <= start.getTime()) {
      form.setError("endLocal", { message: "Debe ser posterior al check-in" })
      return
    }

    try {
      const res = await generateApartmentScheduling(
        {
          buildingId,
          apartmentId: values.apartmentId,
          startDatetime: start.toISOString(),
          endDatetime: end.toISOString(),
          name: values.name.trim(),
          lastName: values.lastName.trim(),
          identificationNumber: values.identificationNumber.trim(),
          email: values.email.trim(),
          cellPhoneNumber: values.cellPhoneNumber?.trim() || undefined,
          createdBy,
        },
        externalToken,
      )

      if (!res.success || !res.data) {
        form.setError("root", {
          message: res.message || "No se pudo generar el agendamiento.",
        })
        return
      }

      closeDialog()
      router.refresh()
    } catch {
      form.setError("root", { message: "No se pudo generar el agendamiento." })
    }
  }

  const rootError = (form.formState.errors as any)?.root?.message as string | undefined

  return (
    <CoinsForm form={form} onSubmit={onSubmit} className="space-y-4">
      {rootError ? (
        <div className="rounded-lg border border-danger-subtle-fg/40 bg-danger-subtle/20 px-3 py-2 text-sm text-danger-subtle-fg">
          {rootError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="apartmentId"
          render={({ field, fieldState }) => (
            <div className="grid gap-1.5">
              <CoinsLabel>Apartamento</CoinsLabel>
              <CoinsSelect
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                options={[
                  { value: "", label: "Selecciona…" },
                  ...apartments.map((a) => ({
                    value: String(a.id ?? ""),
                    label: a.name ?? String(a.id ?? ""),
                  })),
                ]}
              />
              {fieldState.error?.message ? (
                <p role="alert" className="text-sm/6 text-danger-subtle-fg">
                  {fieldState.error.message}
                </p>
              ) : null}
            </div>
          )}
        />

        <CoinsFormField
          form={form}
          name="identificationNumber"
          label="Documento"
          inputProps={{ placeholder: "Cédula" }}
        />

        <CoinsFormField form={form} name="name" label="Nombre" />
        <CoinsFormField form={form} name="lastName" label="Apellido" />

        <CoinsFormField
          form={form}
          name="email"
          label="Correo"
          inputProps={{ placeholder: "correo@dominio.com", inputMode: "email", autoComplete: "email" }}
        />

        <CoinsFormField
          form={form}
          name="cellPhoneNumber"
          label="Celular"
          description="Opcional"
        />

        <CoinsFormField
          form={form}
          name="startLocal"
          label="Check-in"
          inputProps={{ type: "datetime-local" }}
        />

        <CoinsFormField
          form={form}
          name="endLocal"
          label="Check-out"
          inputProps={{ type: "datetime-local" }}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <CoinsButton variant="outline" onClick={closeDialog} isDisabled={form.formState.isSubmitting}>
          Cancelar
        </CoinsButton>
        <CoinsButton
          variant="primary"
          type="submit"
          isLoading={form.formState.isSubmitting}
          isDisabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          Generar
        </CoinsButton>
      </div>
    </CoinsForm>
  )
}
