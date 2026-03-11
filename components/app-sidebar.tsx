"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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
import {
  CircleHelpIcon,
  CommandIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  SearchIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react"

const data = {
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "https://ionexenergy.github.io/ionex-fe-interview-server/api/index.html",
      icon: (
        <SearchIcon
      />
      ),
    },
  ],
  documents: [
    {
      name: "API Data",
      url: "https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws/api/users",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "API Doc",
      url: "https://ionexenergy.github.io/ionex-fe-interview-server/api/index.html",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Swagger",
      url: "https://ionexenergy.github.io/ionex-fe-interview-server/swagger.yaml",
      icon: (
        <FileIcon
        />
      ),
    },
  ],
}

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

export function AppSidebar({ user = defaultUser, onLogout, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const navMain = [
    {
      title: "Users",
      url: "/users",
      icon: (
        <UsersIcon
        />
      ),
      isActive: pathname === "/users",
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Ionex Console</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onLogout={onLogout} user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
