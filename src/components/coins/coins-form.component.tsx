"use client"

import * as React from "react"

import { twMerge } from "tailwind-merge"
import {
  Controller,
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
import CoinsSelect, { type CoinsSelectOption, type CoinsSelectProps } from "@/components/coins/coins-select.component"

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
  required?: boolean
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
  required,
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

  const inferredRequired = Boolean((rules as any)?.required) || Boolean((inputProps as any)?.required)
  const isRequired = required ?? inferredRequired

  return (
    <div className={twMerge("grid gap-1.5", className)}>
      {label ? (
        <CoinsLabel htmlFor={fieldId}>
          {label}
          {isRequired ? (
            <span aria-hidden className="ml-1 text-danger-subtle-fg">
              *
            </span>
          ) : null}
        </CoinsLabel>
      ) : null}

      <CoinsInput
        id={fieldId}
        aria-invalid={Boolean(errorMessage) || undefined}
        {...resolvedForm.register(name, rules)}
        {...inputProps}
      />

      {description ? (
        <p className="text-sm/6 text-muted-fg">{description}</p>
      ) : null}

      <p
        role={errorMessage ? "alert" : undefined}
        className={twMerge(
          "text-sm/6 min-h-6",
          errorMessage ? "text-danger-subtle-fg" : "invisible",
        )}
      >
        {errorMessage ?? "Campo inválido"}
      </p>
    </div>
  )
}

type CoinsFormSelectFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  label?: React.ReactNode
  description?: React.ReactNode
  form?: UseFormReturn<TFieldValues>
  id?: string
  className?: string
  options: CoinsSelectOption[]
  rules?: RegisterOptions<TFieldValues>
  required?: boolean
  selectProps?: Omit<
    CoinsSelectProps,
    "name" | "id" | "value" | "defaultValue" | "onChange" | "onBlur" | "onFocus" | "children" | "options"
  >
}

export function CoinsFormSelectField<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  form,
  id,
  className,
  options,
  rules,
  required,
  selectProps,
}: CoinsFormSelectFieldProps<TFieldValues>) {
  const ctx = useFormContext<TFieldValues>()
  const resolvedForm = form ?? ctx

  const fieldId = id ?? String(name)
  const error = resolvedForm.formState.errors?.[name]
  const errorMessage =
    typeof error?.message === "string" ? error.message : error ? "Campo inválido" : undefined

  const inferredRequired = Boolean((rules as any)?.required) || Boolean((selectProps as any)?.required)
  const isRequired = required ?? inferredRequired

  return (
    <div className={twMerge("grid gap-1.5", className)}>
      {label ? (
        <CoinsLabel htmlFor={fieldId}>
          {label}
          {isRequired ? (
            <span aria-hidden className="ml-1 text-danger-subtle-fg">
              *
            </span>
          ) : null}
        </CoinsLabel>
      ) : null}

      <Controller
        control={resolvedForm.control}
        name={name}
        rules={rules as any}
        render={({ field }) => (
          <CoinsSelect
            id={fieldId}
            name={field.name}
            value={(field.value as unknown as string) ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            options={options}
            aria-invalid={Boolean(errorMessage) || undefined}
            {...(selectProps as any)}
          />
        )}
      />

      {description ? (
        <p className="text-sm/6 text-muted-fg">{description}</p>
      ) : null}

      <p
        role={errorMessage ? "alert" : undefined}
        className={twMerge(
          "text-sm/6 min-h-6",
          errorMessage ? "text-danger-subtle-fg" : "invisible",
        )}
      >
        {errorMessage ?? "Campo inválido"}
      </p>
    </div>
  )
}
