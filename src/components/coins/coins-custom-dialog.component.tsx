"use client"

import * as React from "react"

import { UseDialogContext } from "@/context/dialog.context"
import {
  CoinsModal,
  CoinsModalBody,
  CoinsModalContent,
  CoinsModalDescription,
  CoinsModalFooter,
  CoinsModalHeader,
  CoinsModalTitle,
} from "@/components/coins/coins-modal.component"

export default function CoinsCustomDialog() {
  const { isOpen, title, renderContent, renderFooter, description, setIsOpen, closeDialog } =
    UseDialogContext()

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        setIsOpen(true)
        return
      }
      closeDialog()
    },
    [closeDialog, setIsOpen],
  )

  return (
    <CoinsModal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <CoinsModalContent size="md" className="w-fit sm:max-w-none">
        <CoinsModalHeader>
          <CoinsModalTitle>{title}</CoinsModalTitle>
        </CoinsModalHeader>

        {description ? <CoinsModalDescription>{description}</CoinsModalDescription> : null}

        <CoinsModalBody>{renderContent}</CoinsModalBody>

        {renderFooter ? <CoinsModalFooter>{renderFooter}</CoinsModalFooter> : null}
      </CoinsModalContent>
    </CoinsModal>
  )
}
