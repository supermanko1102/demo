"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2Icon, ListOrderedIcon, Users2Icon, UserX2Icon } from "lucide-react"

interface UsersOverviewCardsProps {
  totalUsers: number
  totalPages: number
  currentPage: number
  activeCount: number
  inactiveCount: number
}

export function UsersOverviewCards({
  totalUsers,
  totalPages,
  currentPage,
  activeCount,
  inactiveCount,
}: UsersOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
      <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users2Icon />
              全量
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>Current Page</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {currentPage} / {totalPages}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ListOrderedIcon />
              分頁
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>Active (Page)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CheckCircle2Icon />
              正常
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
        <CardHeader>
          <CardDescription>Inactive (Page)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {inactiveCount}
          </CardTitle>
          <CardAction>
            <Badge variant="destructive">
              <UserX2Icon />
              停用
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}

