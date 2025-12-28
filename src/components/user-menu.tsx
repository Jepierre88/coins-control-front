"use client"

import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  LifebuoyIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"
import { Avatar } from "@/components/ui/avatar"
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { authClient } from "@/lib/auth-client"
import { redirect } from "next/navigation"
import { toast } from "sonner"
import { LogOut } from "lucide-react"

export function UserMenu() {

  const {
    signOut,
    useSession
  } = authClient

  const sessionQuery = useSession()
  const user = sessionQuery.data?.user

  return (
    <Menu>
      <MenuTrigger aria-label="Open Menu">
        <Avatar
          alt={user?.name ?? "Usuario"}
          size="md"
          isSquare
        >
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </Avatar>
      </MenuTrigger>
      <MenuContent placement="bottom right" className="min-w-60 sm:min-w-56">
        <MenuSection>
          <MenuHeader separator>
            <span className="block">{user?.name ?? "Usuario"}</span>
            <span className="font-normal text-muted-fg">{user?.email ?? ""}</span>
          </MenuHeader>
        </MenuSection>
        <MenuItem onClick={async ()=>{
          await signOut()
          toast.success("Sesión cerrada exitosamente")
          redirect('/auth/login')
        }}
          className={'gap-1'}
        >
          <LogOut size={15} />
          Cerrar sesión
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}
