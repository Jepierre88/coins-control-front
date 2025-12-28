"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import CoinsButton from "@/components/coins/coins-button.component"
import CoinsForm, { CoinsFormField, CoinsFormSelectField } from "@/components/coins/coins-form.component"
import { UseDialogContext } from "@/context/dialog.context"
import {
  generateApartmentScheduling,
  type ApartmentListItem,
} from "@/datasource/coins-control.datasource"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  GenerateSchedulingSchema,
  type GenerateSchedulingSchemaType,
} from "@/core/forms/schemas/generate-scheduling-schema"
import SchedulingQrDialog from "@/components/coins/agendamientos/scheduling-qr-dialog.component"

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
  const { closeDialog, openDialog } = UseDialogContext()

  const defaultStart = React.useMemo(() => toDatetimeLocal(new Date(Date.now() + 60_000)), [])
  const defaultEnd = React.useMemo(() => toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60_000)), [])

  const form = useForm<GenerateSchedulingSchemaType>({
    defaultValues: {
      apartmentId: "",
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

      // Mostrar QR y código en el CustomDialog
      openDialog({
        title: "Agendamiento generado",
        description: "Comparte el QR y el código de acceso con tu visitante.",
        content: (
          <SchedulingQrDialog
              qrValue={String(res.data.schedulingId)}
              code={res.data.keyboardPwd}
              onShare={() => {
                // Compartir QR y código (copiar al portapapeles)
                const text = `QR: ${res.data?.schedulingId ?? "-"}\nCódigo: ${res.data?.keyboardPwd ?? "-"}`;
                navigator.clipboard.writeText(text)
                  .then(() => alert("Copiado al portapapeles"))
                  .catch(() => alert("No se pudo copiar"));
              }}
              />
        ),
      })

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
        <CoinsFormSelectField
          form={form}
          name="apartmentId"
          label="Apartamento"
          required
          options={[
            { value: "", label: "Selecciona…" },
            ...apartments.map((a) => ({
              value: String(a.id ?? ""),
              label: a.name ?? String(a.id ?? ""),
            })),
          ]}
        />

        <CoinsFormField
          form={form}
          name="identificationNumber"
          label="Documento"
          inputProps={{ placeholder: "Cédula", required: true }}
        />

        <CoinsFormField form={form} name="name" label="Nombre" inputProps={{ required: true }} />
        <CoinsFormField form={form} name="lastName" label="Apellido" inputProps={{ required: true }} />

        <CoinsFormField
          form={form}
          name="email"
          label="Correo"
          inputProps={{ placeholder: "correo@dominio.com", inputMode: "email", autoComplete: "email", required: true }}
        />

        <CoinsFormField
          form={form}
          name="cellPhoneNumber"
          label="Celular"
        />

        <CoinsFormField
          form={form}
          name="startLocal"
          label="Check-in"
          inputProps={{ type: "datetime-local", required: true }}
        />

        <CoinsFormField
          form={form}
          name="endLocal"
          label="Check-out"
          inputProps={{ type: "datetime-local", required: true }}
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
