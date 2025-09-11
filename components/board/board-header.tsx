"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ArrowLeft, Settings, Users, MoreHorizontal } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface BoardHeaderProps {
  board: {
    id: string
    title: string
    description: string | null
    profiles: {
      full_name: string | null
      avatar_url: string | null
    }
  }
  members: Array<{
    role: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
      email: string
    }
  }>
  currentUser: User
}

export function BoardHeader({ board, members, currentUser }: BoardHeaderProps) {
  return (
    <header className="border-b bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{board.title}</h1>
              {board.description && <p className="text-gray-600 dark:text-gray-400 mt-1">{board.description}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Board Members */}
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member, index) => (
                  <Avatar key={index} className="w-8 h-8 border-2 border-white dark:border-gray-800">
                    <AvatarImage src={member.profiles.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {member.profiles.full_name?.charAt(0) || member.profiles.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">+{members.length - 4}</span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>

            {/* Board Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Board Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Members
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
