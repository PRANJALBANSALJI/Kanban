"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Activity, Plus, Edit, Trash, Move } from "lucide-react"

interface RecentActivityProps {
  auditLogs: Array<{
    id: string
    action: string
    entity_type: string
    entity_id: string
    old_values: any
    new_values: any
    created_at: string
    profiles: {
      full_name: string | null
      email: string
    }
    boards: {
      title: string
    }
  }>
}

const getActionIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case "create":
    case "insert":
      return Plus
    case "update":
      return Edit
    case "delete":
      return Trash
    case "move":
      return Move
    default:
      return Activity
  }
}

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "create":
    case "insert":
      return "text-green-600 dark:text-green-400"
    case "update":
      return "text-blue-600 dark:text-blue-400"
    case "delete":
      return "text-red-600 dark:text-red-400"
    case "move":
      return "text-purple-600 dark:text-purple-400"
    default:
      return "text-gray-600 dark:text-gray-400"
  }
}

const formatActionDescription = (log: any) => {
  const action = log.action.toLowerCase()
  const entityType = log.entity_type.toLowerCase()

  switch (action) {
    case "create":
    case "insert":
      return `Created a new ${entityType}`
    case "update":
      return `Updated a ${entityType}`
    case "delete":
      return `Deleted a ${entityType}`
    case "move":
      return `Moved a ${entityType}`
    default:
      return `${log.action} ${entityType}`
  }
}

export function RecentActivity({ auditLogs }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Recent Activity</span>
          <Badge variant="secondary">{auditLogs.length}</Badge>
        </CardTitle>
        <CardDescription>Latest actions across all boards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            auditLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action)
              const actionColor = getActionColor(log.action)

              return (
                <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
                    <ActionIcon className={`w-4 h-4 ${actionColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {log.profiles.full_name?.charAt(0) || log.profiles.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{log.profiles.full_name || log.profiles.email}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatActionDescription(log)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>in {log.boards.title}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                    </div>
                    {log.new_values && typeof log.new_values === "object" && (
                      <div className="mt-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {log.entity_type}: {log.new_values.title || log.new_values.name || "Updated"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
