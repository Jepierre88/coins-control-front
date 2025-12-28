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
import {
  CoinsSheet,
  CoinsSheetBody,
  CoinsSheetContent,
  CoinsSheetDescription,
  CoinsSheetFooter,
  CoinsSheetHeader,
  CoinsSheetTitle,
} from "@/components/coins/coins-sheet.component"

export default function CoinsCustomDialog() {
  const { isOpen, title, renderContent, renderFooter, description, setIsOpen, closeDialog } =
    UseDialogContext()

  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

  if (isMobile) {
    return (
      <CoinsSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
        <CoinsSheetContent closeButton className="max-h-[90vh]" onOpenChange={handleOpenChange}>
          <CoinsSheetHeader>
            <CoinsSheetTitle>{title}</CoinsSheetTitle>
            {description ? <CoinsSheetDescription>{description}</CoinsSheetDescription> : null}
          </CoinsSheetHeader>

          <CoinsSheetBody>{renderContent}</CoinsSheetBody>

          {renderFooter ? <CoinsSheetFooter>{renderFooter}</CoinsSheetFooter> : null}
        </CoinsSheetContent>
      </CoinsSheet>
    )
  }

  return (
    <CoinsModal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <CoinsModalContent size="md" className="w-fit sm:max-w-none py-2">
        <CoinsModalHeader>
          <CoinsModalTitle>{title}</CoinsModalTitle>
          {description ? <CoinsModalDescription>{description}</CoinsModalDescription> : null}
        </CoinsModalHeader>

        <CoinsModalBody>{renderContent}</CoinsModalBody>

        {renderFooter ? <CoinsModalFooter>{renderFooter}</CoinsModalFooter> : null}
      </CoinsModalContent>
    </CoinsModal>
  )
}
