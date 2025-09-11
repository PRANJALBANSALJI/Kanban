"use client"

import { useEffect, useState } from "react"

interface PresenceState {
  user_id: string
  user_name: string
  avatar_url?: string
  cursor_position?: { x: number; y: number }
  current_card_id?: string
  status: "online" | "away"
}

interface LiveCursorsProps {
  presenceState: Record<string, PresenceState>
}

const CURSOR_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
]

export function LiveCursors({ presenceState }: LiveCursorsProps) {
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; color: string; name: string }>>({})

  useEffect(() => {
    const newCursors: Record<string, { x: number; y: number; color: string; name: string }> = {}

    Object.entries(presenceState).forEach(([key, presence], index) => {
      if (presence.cursor_position) {
        newCursors[key] = {
          x: presence.cursor_position.x,
          y: presence.cursor_position.y,
          color: CURSOR_COLORS[index % CURSOR_COLORS.length],
          name: presence.user_name,
        }
      }
    })

    setCursors(newCursors)
  }, [presenceState])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-2px, -2px)",
          }}
        >
          {/* Cursor */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
            <path
              d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* Name label */}
          <div
            className="absolute top-5 left-2 px-2 py-1 rounded text-xs font-medium text-white shadow-lg pointer-events-none whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  )
}
