"use client"

import * as React from "react"
import { motion, useMotionValue, useDragControls, PanInfo } from "framer-motion"
import type { DialogProps, ModalOverlayProps } from "react-aria-components"
import { Modal, ModalOverlay } from "react-aria-components"
import { cx } from "@/lib/primitive"
import {
  Dialog,
  DialogBody,
  DialogCloseIcon,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CoinsSheetProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

type CoinsSheetContentProps = Omit<ModalOverlayProps, "children"> & {
    enableDrag?: boolean
    dragThreshold?: number
    closeButton?: boolean
    className?: string
    role?: "dialog" | "alertdialog"
    children: React.ReactNode
  }

function CoinsSheet({ isOpen, onOpenChange, children }: CoinsSheetProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm entering:fade-in entering:animate-in entering:duration-300 exiting:fade-out exiting:animate-out exiting:duration-200"
    >
      {children}
    </ModalOverlay>
  )
}

function CoinsSheetContent({
  children,
  enableDrag = true,
  dragThreshold = 150,
  className,
  closeButton = true,
  role = "dialog",
  onOpenChange,
  ...props
}: CoinsSheetContentProps) {
  const y = useMotionValue(0)
  const dragControls = useDragControls()

  const handleDragEnd = React.useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > dragThreshold || info.velocity.y > 500) {
        onOpenChange?.(false)
      }
    },
    [dragThreshold, onOpenChange],
  )

  if (!enableDrag) {
    return (
      <Modal
        className={cx(
          "fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl border-t bg-overlay text-overlay-fg shadow-2xl ring-1 ring-fg/5 dark:ring-border",
          "entering:slide-in-from-bottom entering:animate-in entering:duration-300",
          "exiting:slide-out-to-bottom exiting:animate-out exiting:duration-200",
          className,
        )}
      >
        <Dialog role={role} className="flex max-h-[90vh] flex-col sm:[--gutter:--spacing(6)]">
          {children}
          {closeButton && <DialogCloseIcon className="top-2.5 right-2.5" isDismissable />}
        </Dialog>
      </Modal>
    )
  }

  return (
    <motion.div
      style={{ y }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={handleDragEnd}
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <Modal
        className={cx(
          "max-h-[90vh] overflow-hidden rounded-t-3xl border-t bg-overlay text-overlay-fg shadow-2xl ring-1 ring-fg/5 dark:ring-border",
          className,
        )}
      >
        <Dialog role={role} className="flex max-h-[90vh] flex-col sm:[--gutter:--spacing(6)]">
          {/* Drag handle */}
          <motion.div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex cursor-grab items-center justify-center pb-2 pt-3 active:cursor-grabbing"
          >
            <div className="h-1.5 w-12 rounded-full bg-muted-fg/40" />
          </motion.div>
          {children}
          {closeButton && <DialogCloseIcon className="top-2.5 right-2.5" isDismissable />}
        </Dialog>
      </Modal>
    </motion.div>
  )
}

const CoinsSheetHeader = DialogHeader
const CoinsSheetTitle = DialogTitle
const CoinsSheetDescription = DialogDescription
const CoinsSheetBody = DialogBody
const CoinsSheetFooter = DialogFooter

export {
  CoinsSheet,
  CoinsSheetContent,
  CoinsSheetHeader,
  CoinsSheetTitle,
  CoinsSheetDescription,
  CoinsSheetBody,
  CoinsSheetFooter,
}
