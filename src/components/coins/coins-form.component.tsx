"use client"

import * as React from "react"

import { twMerge } from "tailwind-merge"
import {
  FormProvider,
  type FieldValues,
  type Path,
  type RegisterOptions,
  type SubmitHandler,
  type UseFormReturn,
  useFormContext,
} from "react-hook-form"

import CoinsInput, { type CoinsInputProps } from "@/components/coins/coins-input.component"
import CoinsLabel from "@/components/coins/coins-label.component"

export type CoinsFormProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  className?: string
  children: React.ReactNode
}

export default function CoinsForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
}: CoinsFormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  )
}

type CoinsFormFieldBaseProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  label?: React.ReactNode
  description?: React.ReactNode
  rules?: RegisterOptions<TFieldValues>
  form?: UseFormReturn<TFieldValues>
  id?: string
  className?: string
  inputProps?: Omit<CoinsInputProps, "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref" | "id">
}

export function CoinsFormField<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  rules,
  form,
  id,
  className,
  inputProps,
}: CoinsFormFieldBaseProps<TFieldValues>) {
  const ctx = useFormContext<TFieldValues>()
  const resolvedForm = form ?? ctx

  const fieldId = id ?? String(name)
  const error = resolvedForm.formState.errors?.[name]
  const errorMessage =
    typeof error?.message === "string" ? error.message : error ? "Campo inválido" : undefined

  return (
    <div className={twMerge("grid gap-1.5", className)}>
      {label ? <CoinsLabel htmlFor={fieldId}>{label}</CoinsLabel> : null}

      <CoinsInput
        id={fieldId}
        aria-invalid={Boolean(errorMessage) || undefined}
        {...resolvedForm.register(name, rules)}
        {...inputProps}
      />

      {description ? (
        <p className="text-sm/6 text-muted-fg">{description}</p>
      ) : null}

      {errorMessage ? (
        <p role="alert" className="text-sm/6 text-danger-subtle-fg">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
