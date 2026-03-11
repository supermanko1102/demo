"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CommandIcon, UsersIcon } from "lucide-react"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar: string
  }
  onLogout?: () => void
}

const defaultUser = {
  name: "Admin",
  email: "admin@ionex.local",
  avatar: "https://api.dicebear.com/9.x/glass/svg?seed=IonexAdmin",
}

/** 導航定義。新增頁面只需在這裡加項目，不需要修改 AppSidebar 本身。 */
const NAV_ITEMS = [
  { title: "Users", url: "/users", Icon: UsersIcon },
] as const

export function AppSidebar({ user = defaultUser, onLogout, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const navMain = NAV_ITEMS.map((item) => ({
    title: item.title,
    url: item.url,
    icon: <item.Icon />,
    isActive: pathname === item.url,
  }))

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/users">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Ionex Console</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onLogout={onLogout} user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
