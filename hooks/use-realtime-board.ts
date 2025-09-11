"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface UseRealtimeBoardProps {
  boardId: string
  onCardUpdate: (payload: any) => void
  onColumnUpdate: (payload: any) => void
  onCardMove: (payload: any) => void
}

export function useRealtimeBoard({ boardId, onCardUpdate, onColumnUpdate, onCardMove }: UseRealtimeBoardProps) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const boardChannel = supabase
      .channel(`board-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
          filter: `column_id=in.(select id from columns where board_id=eq.${boardId})`,
        },
        (payload) => {
          console.log("[v0] Card change received:", payload)
          if (payload.eventType === "UPDATE") {
            onCardUpdate(payload)
          } else if (payload.eventType === "INSERT") {
            onCardUpdate(payload)
          } else if (payload.eventType === "DELETE") {
            onCardUpdate(payload)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          console.log("[v0] Column change received:", payload)
          onColumnUpdate(payload)
        },
      )
      .on("broadcast", { event: "card_move" }, (payload) => {
        console.log("[v0] Card move broadcast received:", payload)
        onCardMove(payload)
      })
      .subscribe()

    setChannel(boardChannel)

    return () => {
      supabase.removeChannel(boardChannel)
    }
  }, [boardId, onCardUpdate, onColumnUpdate, onCardMove, supabase])

  const broadcastCardMove = (cardId: string, fromColumn: string, toColumn: string, position: number) => {
    if (channel) {
      channel.send({
        type: "broadcast",
        event: "card_move",
        payload: { cardId, fromColumn, toColumn, position, timestamp: Date.now() },
      })
    }
  }

  return { broadcastCardMove }
}
