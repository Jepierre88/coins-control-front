"use client"

import * as React from "react"

import CoinsButton from "@/components/coins/coins-button.component"

type DialogProviderProps = {
  children: React.ReactNode
}

export type YesNoDialogOptions = {
  handleYes: () => void | Promise<void>
  handleNo: () => void | Promise<void>
  title: string
  description?: string
  requiresReloadOnYes?: boolean
}

export type OpenDialogOptions = {
  title: string
  description?: string
  content: React.ReactNode
  footer?: React.ReactNode
}

export type TDialogContext = {
  isOpen: boolean
  title: string
  description: string
  renderContent: React.ReactNode
  renderFooter: React.ReactNode
  showYesNoDialog: (options: YesNoDialogOptions) => void
  openDialog: (options: OpenDialogOptions) => void
  setIsOpen: (isOpen: boolean) => void
  closeDialog: () => void
}

const DialogContext = React.createContext<TDialogContext | null>(null)

export function UseDialogContext() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) {
    throw new Error("UseDialogContext must be used within a DialogProvider")
  }
  return ctx
}

function CoinsYesNoFooter({
  onYes,
  onNo,
  requiresReloadOnYes,
}: {
  onYes: () => void | Promise<void>
  onNo: () => void | Promise<void>
  requiresReloadOnYes?: boolean
}) {
  const [isLoading, setIsLoading] = React.useState<"yes" | "no" | null>(null)

  const handleYesClick = async () => {
    try {
      setIsLoading("yes")
      await onYes()
      if (requiresReloadOnYes) {
        window.location.reload()
      }
    } finally {
      setIsLoading(null)
    }
  }

  const handleNoClick = async () => {
    try {
      setIsLoading("no")
      await onNo()
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <CoinsButton variant="outline" onClick={handleNoClick} isLoading={isLoading === "no"}>
        No
      </CoinsButton>
      <CoinsButton variant="primary" onClick={handleYesClick} isLoading={isLoading === "yes"}>
        Sí
      </CoinsButton>
    </div>
  )
}

export function DialogProvider({ children }: DialogProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [renderContent, setRenderContent] = React.useState<React.ReactNode>(null)
  const [renderFooter, setRenderFooter] = React.useState<React.ReactNode>(null)

  const resetDialogState = React.useCallback(() => {
    setTitle("")
    setDescription("")
    setRenderContent(null)
    setRenderFooter(null)
  }, [])

  const closeDialog = React.useCallback(() => {
    setIsOpen(false)
    resetDialogState()
  }, [resetDialogState])

  const showYesNoDialog = React.useCallback(
    ({ handleYes, handleNo, title, description, requiresReloadOnYes }: YesNoDialogOptions) => {
      setTitle(title)
      setDescription(description ?? "")
      setRenderFooter(null)
      setRenderContent(
        <CoinsYesNoFooter
          onYes={async () => {
            await handleYes()
            closeDialog()
          }}
          onNo={async () => {
            await handleNo()
            closeDialog()
          }}
          requiresReloadOnYes={requiresReloadOnYes}
        />,
      )
      setIsOpen(true)
    },
    [closeDialog],
  )

  const openDialog = React.useCallback(({ title, description, content, footer }: OpenDialogOptions) => {
    setTitle(title)
    setDescription(description ?? "")
    setRenderContent(content)
    setRenderFooter(footer ?? null)
    setIsOpen(true)
  }, [])

  const value = React.useMemo<TDialogContext>(
    () => ({
      isOpen,
      title,
      description,
      renderContent,
      renderFooter,
      showYesNoDialog,
      openDialog,
      setIsOpen,
      closeDialog,
    }),
    [closeDialog, description, isOpen, openDialog, renderContent, renderFooter, showYesNoDialog, title],
  )

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}
