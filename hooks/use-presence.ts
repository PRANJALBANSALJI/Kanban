"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface PresenceState {
  user_id: string
  user_name: string
  avatar_url?: string
  cursor_position?: { x: number; y: number }
  current_card_id?: string
  status: "online" | "away"
}

interface UsePresenceProps {
  boardId: string
  user: {
    id: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
    email?: string
  }
}

export function usePresence({ boardId, user }: UsePresenceProps) {
  const [presenceState, setPresenceState] = useState<Record<string, PresenceState>>({})
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const presenceChannel = supabase
      .channel(`presence-${boardId}`)
      .on("presence", { event: "sync" }, () => {
        const newState = presenceChannel.presenceState()
        console.log("[v0] Presence sync:", newState)

        const formattedState: Record<string, PresenceState> = {}
        Object.entries(newState).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            formattedState[key] = presences[0] as PresenceState
          }
        })
        setPresenceState(formattedState)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("[v0] User joined:", key, newPresences)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("[v0] User left:", key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const presenceTrack = {
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email || "Anonymous",
            avatar_url: user.user_metadata?.avatar_url,
            status: "online" as const,
          }

          await presenceChannel.track(presenceTrack)
        }
      })

    setChannel(presenceChannel)

    return () => {
      supabase.removeChannel(presenceChannel)
    }
  }, [boardId, user, supabase])

  const updatePresence = async (updates: Partial<PresenceState>) => {
    if (channel) {
      const currentPresence = {
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email || "Anonymous",
        avatar_url: user.user_metadata?.avatar_url,
        status: "online" as const,
        ...updates,
      }

      await channel.track(currentPresence)
    }
  }

  const updateCursorPosition = (x: number, y: number) => {
    updatePresence({ cursor_position: { x, y } })
  }

  const updateCurrentCard = (cardId?: string) => {
    updatePresence({ current_card_id: cardId })
  }

  // Filter out current user from presence state
  const otherUsers = Object.entries(presenceState).filter(([_, presence]) => presence.user_id !== user.id)

  return {
    presenceState: Object.fromEntries(otherUsers),
    updateCursorPosition,
    updateCurrentCard,
    updatePresence,
  }
}
