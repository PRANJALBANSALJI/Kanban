"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Folder, Activity, Eye } from "lucide-react"

interface AdminStatsProps {
  boards: Array<{
    id: string
    title: string
    created_at: string
    board_members: { count: number }[]
  }>
  users: Array<{
    id: string
    email: string
    created_at: string
  }>
  auditLogs: Array<{
    id: string
    created_at: string
  }>
  presence: Array<{
    id: string
    status: string
  }>
}

export function AdminStats({ boards, users, auditLogs, presence }: AdminStatsProps) {
  const totalMembers = boards.reduce((sum, board) => sum + (board.board_members[0]?.count || 0), 0)

  const recentActivity = auditLogs.filter(
    (log) => new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000),
  ).length

  const stats = [
    {
      title: "Total Boards",
      value: boards.length,
      icon: Folder,
      description: "Active project boards",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      description: "Registered users",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Online Now",
      value: presence.length,
      icon: Eye,
      description: "Currently active",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Today's Activity",
      value: recentActivity,
      icon: Activity,
      description: "Actions in last 24h",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
