"use client"

import type {
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsProps as TabsPrimitiveProps,
} from "react-aria-components"
import {
  Tab,
  TabList,
  TabPanel,
  Tabs as TabsPrimitive,
  composeRenderProps,
} from "react-aria-components"
import { tv } from "tailwind-variants"
import { cx } from "@/lib/primitive"

const tabsListStyles = tv({
  base: [
    "flex items-center gap-2",
    "rounded-xl border bg-muted/30 p-1",
    "overflow-x-auto",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  ],
})

const tabStyles = tv({
  base: [
    "relative inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-lg px-3 py-2 text-sm/6 font-medium",
    "text-muted-fg",
    "outline-hidden focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:opacity-50",
  ],
  variants: {
    isSelected: {
      true: "bg-bg text-fg shadow-xs",
    },
    isHovered: {
      true: "text-fg",
    },
    isFocusVisible: {
      true: "text-fg",
    },
  },
})

interface TabsProps extends TabsPrimitiveProps {
  className?: string
}

const Tabs = ({ className, ...props }: TabsProps) => {
  return <TabsPrimitive data-slot="tabs" className={cx("w-full", className)} {...props} />
}

interface TabsListProps<T extends object> extends TabListProps<T> {
  className?: string
}

const TabsList = <T extends object>({ className, ...props }: TabsListProps<T>) => {
  return (
    <TabList data-slot="tabs-list" className={tabsListStyles({ className })} {...props} />
  )
}

interface TabsTabProps extends TabProps {
  className?: string
}

const TabsTab = ({ className, ...props }: TabsTabProps) => {
  return (
    <Tab
      data-slot="tabs-tab"
      className={composeRenderProps(className, (className, renderProps) =>
        tabStyles({ ...renderProps, className }),
      )}
      {...props}
    />
  )
}

interface TabsPanelProps extends TabPanelProps {
  className?: string
}

const TabsPanel = ({ className, ...props }: TabsPanelProps) => {
  return (
    <TabPanel
      data-slot="tabs-panel"
      className={cx("mt-4 outline-hidden", className)}
      {...props}
    />
  )
}

export type { TabsProps, TabsListProps, TabsTabProps, TabsPanelProps }
export { Tabs, TabsList, TabsTab, TabsPanel }
