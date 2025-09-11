"use client"

import { useState, useEffect, useCallback } from "react"
import { DndContext, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { CreateColumnButton } from "./create-column-button"
import { PresenceAvatars } from "./presence-avatars"
import { LiveCursors } from "./live-cursors"
import { useRealtimeBoard } from "@/hooks/use-realtime-board"
import { usePresence } from "@/hooks/use-presence"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Card {
  id: string
  title: string
  description: string | null
  position: number
  assignee_id: string | null
  due_date: string | null
  created_by: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
  card_labels: Array<{
    labels: {
      id: string
      name: string
      color: string
    }
  }>
}

interface Column {
  id: string
  title: string
  position: number
  cards: Card[]
}

interface CollaborativeKanbanBoardProps {
  boardId: string
  columns: Column[]
  members: Array<{
    role: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
      email: string
    }
  }>
  labels: Array<{
    id: string
    name: string
    color: string
  }>
  currentUser: User
}

export function CollaborativeKanbanBoard({
  boardId,
  columns: initialColumns,
  members,
  labels,
  currentUser,
}: CollaborativeKanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [activeId, setActiveId] = useState<string | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const { presenceState, updateCursorPosition, updateCurrentCard } = usePresence({
    boardId,
    user: currentUser,
  })

  const handleCardUpdate = useCallback((payload: any) => {
    console.log("[v0] Handling card update:", payload)
    // Refresh the board data when cards change
    window.location.reload()
  }, [])

  const handleColumnUpdate = useCallback((payload: any) => {
    console.log("[v0] Handling column update:", payload)
    // Refresh the board data when columns change
    window.location.reload()
  }, [])

  const handleCardMove = useCallback((payload: any) => {
    console.log("[v0] Handling card move broadcast:", payload)
    // Handle real-time card movements from other users
  }, [])

  const { broadcastCardMove } = useRealtimeBoard({
    boardId,
    onCardUpdate: handleCardUpdate,
    onColumnUpdate: handleColumnUpdate,
    onCardMove: handleCardMove,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateCursorPosition(e.clientX, e.clientY)
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [updateCursorPosition])

  // Sort columns by position and cards by position within each column
  useEffect(() => {
    const sortedColumns = [...initialColumns]
      .sort((a, b) => a.position - b.position)
      .map((column) => ({
        ...column,
        cards: [...column.cards].sort((a, b) => a.position - b.position),
      }))
    setColumns(sortedColumns)
  }, [initialColumns])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    updateCurrentCard(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    updateCurrentCard(undefined)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active card and its current column
    let activeCard: Card | null = null
    let activeColumnId: string | null = null

    for (const column of columns) {
      const card = column.cards.find((c) => c.id === activeId)
      if (card) {
        activeCard = card
        activeColumnId = column.id
        break
      }
    }

    if (!activeCard || !activeColumnId) return

    // Determine target column
    let targetColumnId = overId

    // If dropped on a card, get its column
    for (const column of columns) {
      if (column.cards.some((c) => c.id === overId)) {
        targetColumnId = column.id
        break
      }
    }

    // If dropped on the same position, do nothing
    if (activeColumnId === targetColumnId && activeId === overId) return

    try {
      // Update card's column and position in database
      const targetColumn = columns.find((c) => c.id === targetColumnId)
      if (!targetColumn) return

      let newPosition = 0
      if (overId !== targetColumnId) {
        // Dropped on a card, calculate position
        const targetCardIndex = targetColumn.cards.findIndex((c) => c.id === overId)
        newPosition = targetCardIndex >= 0 ? targetColumn.cards[targetCardIndex].position : targetColumn.cards.length
      } else {
        // Dropped on column, add to end
        newPosition = targetColumn.cards.length
      }

      const { error } = await supabase
        .from("cards")
        .update({
          column_id: targetColumnId,
          position: newPosition,
        })
        .eq("id", activeId)

      if (error) throw error

      broadcastCardMove(activeId, activeColumnId, targetColumnId, newPosition)

      // Update local state
      setColumns((prevColumns) => {
        const newColumns = [...prevColumns]

        // Remove card from source column
        const sourceColumn = newColumns.find((c) => c.id === activeColumnId)
        if (sourceColumn) {
          sourceColumn.cards = sourceColumn.cards.filter((c) => c.id !== activeId)
        }

        // Add card to target column
        const targetCol = newColumns.find((c) => c.id === targetColumnId)
        if (targetCol) {
          const updatedCard = { ...activeCard, column_id: targetColumnId, position: newPosition }
          targetCol.cards.splice(newPosition, 0, updatedCard)

          // Reorder positions
          targetCol.cards.forEach((card, index) => {
            card.position = index
          })
        }

        return newColumns
      })
    } catch (error) {
      console.error("Error moving card:", error)
    }
  }

  const addColumn = (newColumn: Column) => {
    setColumns((prev) => [...prev, newColumn].sort((a, b) => a.position - b.position))
  }

  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, ...updates } : col)))
  }

  const deleteColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId))
  }

  const addCard = (columnId: string, newCard: Card) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, newCard].sort((a, b) => a.position - b.position) } : col,
      ),
    )
  }

  const updateCard = (cardId: string, updates: Partial<Card>) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
      })),
    )
  }

  const deleteCard = (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      })),
    )
  }

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between">
        <PresenceAvatars presenceState={presenceState} />
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex space-x-6 overflow-x-auto pb-6">
          <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                boardId={boardId}
                members={members}
                labels={labels}
                presenceState={presenceState}
                onUpdateColumn={updateColumn}
                onDeleteColumn={deleteColumn}
                onAddCard={addCard}
                onUpdateCard={updateCard}
                onDeleteCard={deleteCard}
              />
            ))}
          </SortableContext>
          <CreateColumnButton boardId={boardId} onAddColumn={addColumn} />
        </div>
      </DndContext>

      <LiveCursors presenceState={presenceState} />
    </div>
  )
}
