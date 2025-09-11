"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, Users } from "lucide-react"

interface ActiveBoardsProps {
  boards: Array<{
    id: string
    title: string
    description: string | null
    created_at: string
    profiles: {
      full_name: string | null
      email: string
    }
    board_members: { count: number }[]
  }>
}

export function ActiveBoards({ boards }: ActiveBoardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Active Boards</span>
          <Badge variant="secondary">{boards.length}</Badge>
        </CardTitle>
        <CardDescription>All project boards in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {boards.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">No boards found</p>
          ) : (
            boards.map((board) => (
              <div key={board.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {board.profiles.full_name?.charAt(0) || board.profiles.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-medium">{board.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>by {board.profiles.full_name || board.profiles.email}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(board.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  {board.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{board.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>{board.board_members[0]?.count || 0}</span>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/board/${board.id}`}>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
