"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface PresenceState {
  user_id: string
  user_name: string
  avatar_url?: string
  cursor_position?: { x: number; y: number }
  current_card_id?: string
  status: "online" | "away"
}

interface CollaborativeCardIndicatorProps {
  cardId: string
  presenceState: Record<string, PresenceState>
}

export function CollaborativeCardIndicator({ cardId, presenceState }: CollaborativeCardIndicatorProps) {
  const usersEditingCard = Object.values(presenceState).filter((user) => user.current_card_id === cardId)

  if (usersEditingCard.length === 0) {
    return null
  }

  return (
    <div className="absolute -top-2 -right-2 flex -space-x-1">
      {usersEditingCard.slice(0, 3).map((user) => (
        <div key={user.user_id} className="relative">
          <Avatar className="w-6 h-6 border-2 border-white dark:border-gray-800">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">{user.user_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white dark:border-gray-800 rounded-full animate-pulse"></div>
        </div>
      ))}
      {usersEditingCard.length > 3 && (
        <Badge variant="secondary" className="text-xs ml-1">
          +{usersEditingCard.length - 3}
        </Badge>
      )}
    </div>
  )
}
