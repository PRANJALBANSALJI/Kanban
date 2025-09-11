"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PresenceState {
  user_id: string
  user_name: string
  avatar_url?: string
  cursor_position?: { x: number; y: number }
  current_card_id?: string
  status: "online" | "away"
}

interface PresenceAvatarsProps {
  presenceState: Record<string, PresenceState>
  maxVisible?: number
}

export function PresenceAvatars({ presenceState, maxVisible = 5 }: PresenceAvatarsProps) {
  const users = Object.values(presenceState)
  const visibleUsers = users.slice(0, maxVisible)
  const hiddenCount = users.length - maxVisible

  if (users.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Online:</span>
        <div className="flex -space-x-2">
          {visibleUsers.map((user) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="w-8 h-8 border-2 border-white dark:border-gray-800">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{user.user_name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{user.user_name}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {user.status}
                  </Badge>
                  {user.current_card_id && <p className="text-xs text-gray-500 mt-1">Editing a card</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {hiddenCount > 0 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">+{hiddenCount}</span>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
