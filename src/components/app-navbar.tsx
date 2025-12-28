"use client"
import { Avatar } from "@/components/ui/avatar"
import { Link } from "@/components/ui/link"
import { GlobalLoader } from "@/components/global-loader"
import CoinsCircle from "@/public/img/coins-circle.png"
import {
  Navbar,
  NavbarGap,
  NavbarItem,
  NavbarMobile,
  type NavbarProps,
  NavbarProvider,
  NavbarSection,
  NavbarSeparator,
  NavbarSpacer,
  NavbarStart,
  NavbarTrigger,
} from "@/components/ui/navbar"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/user-menu"
import CoinsBuildingSelect from "@/components/coins/coins-building-select.component"
import { ThemeSwitcher } from "@/components/theme-switcher"

const categories = [
  { id: 1, label: "Electronics", url: "#" },
  { id: 2, label: "Fashion", url: "#" },
  { id: 3, label: "Home & Kitchen", url: "#" },
  { id: 4, label: "Sports", url: "#" },
  { id: 5, label: "Books", url: "#" },
  { id: 6, label: "Beauty & Personal Care", url: "#" },
  { id: 7, label: "Grocery", url: "#" },
  { id: 8, label: "Toys & Games", url: "#" },
  { id: 9, label: "Automotive", url: "#" },
  { id: 10, label: "Health & Wellness", url: "#" },
]

export default function AppNavbar(props: NavbarProps) {
  return (
    <NavbarProvider>
      <div className="relative">
        <Navbar isSticky {...props}>
          <NavbarStart>
          <Link
            className="flex items-center gap-x-2 font-medium"
            aria-label="Goto documentation of Navbar"
            href="/docs/components/layouts/navbar"
          >
            <Avatar
              isSquare
              size="sm"
              className="outline-hidden"
              src={CoinsCircle.src}
            />
            <span>
              COINS CONTROL
            </span>
          </Link>
        </NavbarStart>
        <NavbarGap />
        <NavbarSection>
          <NavbarItem href="/admin" isCurrent>
            Inicio
          </NavbarItem>
          <NavbarItem href="/admin/agendamientos">
            Agendamientos
          </NavbarItem>
          {/* <Menu>
            <NavbarItem>
              Categories
              <ChevronDownIcon className="col-start-3" />
            </NavbarItem>
            <MenuContent className="min-w-(--trigger-width) sm:min-w-56" items={categories}>
              {(item) => (
                <MenuItem id={item.id} textValue={item.label} href={item.url}>
                  {item.label}
                </MenuItem>
              )}
            </MenuContent>
          </Menu> */}
        </NavbarSection>
        <NavbarSpacer />
        <NavbarSection className="max-md:hidden">
          <CoinsBuildingSelect />
          <ThemeSwitcher />
          <Separator orientation="vertical" className="mr-3 ml-1 h-5" />
          <UserMenu />
        </NavbarSection>
      </Navbar>
      <GlobalLoader />
      <NavbarMobile>
        <NavbarTrigger />
        <NavbarSpacer />
        <CoinsBuildingSelect />
        <ThemeSwitcher />
        <NavbarSeparator className="mr-2.5" />
        <UserMenu />
      </NavbarMobile>
      </div>
    </NavbarProvider>
  )
}
