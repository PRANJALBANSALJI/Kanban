"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Circle } from "lucide-react"

interface ConnectedUsersProps {
  presence: Array<{
    id: string
    status: string
    last_seen: string
    profiles: {
      full_name: string | null
      email: string
    }
    boards: {
      title: string
    }
  }>
}

export function ConnectedUsers({ presence }: ConnectedUsersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Connected Users</span>
          <Badge variant="secondary">{presence.length}</Badge>
        </CardTitle>
        <CardDescription>Users currently online and active</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {presence.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">No users currently online</p>
          ) : (
            presence.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {user.profiles.full_name?.charAt(0) || user.profiles.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{user.profiles.full_name || user.profiles.email}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                      <span>Active in {user.boards.title}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
