"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Calendar, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Board {
  id: string
  title: string
  description: string | null
  created_at: string
  board_members: { role: string }[]
  profiles: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface BoardGridProps {
  boards: Board[]
}

export function BoardGrid({ boards }: BoardGridProps) {
  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No boards yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create your first board to get started with project management
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board) => (
        <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/board/${board.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{board.title}</CardTitle>
                  {board.description && <CardDescription className="line-clamp-2">{board.description}</CardDescription>}
                </div>
                <Badge variant="secondary" className="ml-2">
                  {board.board_members[0]?.role || "member"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{board.board_members.length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(board.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={board.profiles.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{board.profiles.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}
