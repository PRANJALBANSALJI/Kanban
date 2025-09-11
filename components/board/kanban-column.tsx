"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { KanbanCard } from "./kanban-card"
import { CreateCardDialog } from "./create-card-dialog"
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PresenceState {
  user_id: string
  user_name: string
  avatar_url?: string
  cursor_position?: { x: number; y: number }
  current_card_id?: string
  status: "online" | "away"
}

interface CardType {
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

interface KanbanColumnProps {
  column: {
    id: string
    title: string
    position: number
    cards: CardType[]
  }
  boardId: string
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
  presenceState: Record<string, PresenceState>
  onUpdateColumn: (columnId: string, updates: Partial<{ title: string; position: number }>) => void
  onDeleteColumn: (columnId: string) => void
  onAddCard: (columnId: string, card: CardType) => void
  onUpdateCard: (cardId: string, updates: Partial<CardType>) => void
  onDeleteCard: (cardId: string) => void
}

export function KanbanColumn({
  column,
  boardId,
  members,
  labels,
  presenceState,
  onUpdateColumn,
  onDeleteColumn,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const supabase = createClient()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleUpdateTitle = async () => {
    if (title.trim() === column.title) {
      setIsEditing(false)
      return
    }

    try {
      const { error } = await supabase.from("columns").update({ title: title.trim() }).eq("id", column.id)

      if (error) throw error

      onUpdateColumn(column.id, { title: title.trim() })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating column:", error)
      setTitle(column.title)
    }
  }

  const handleDeleteColumn = async () => {
    try {
      const { error } = await supabase.from("columns").delete().eq("id", column.id)

      if (error) throw error

      onDeleteColumn(column.id)
    } catch (error) {
      console.error("Error deleting column:", error)
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={`w-80 flex-shrink-0 ${isDragging ? "opacity-50" : ""}`}>
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateTitle()
                  if (e.key === "Escape") {
                    setTitle(column.title)
                    setIsEditing(false)
                  }
                }}
                className="text-sm font-medium"
                autoFocus
              />
            ) : (
              <h3
                className="text-sm font-medium cursor-pointer hover:text-primary"
                onClick={() => setIsEditing(true)}
                {...attributes}
                {...listeners}
              >
                {column.title}
                <span className="ml-2 text-xs text-gray-500">({column.cards.length})</span>
              </h3>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteColumn} className="text-red-600 dark:text-red-400">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              members={members}
              labels={labels}
              presenceState={presenceState}
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
            />
          ))}

          <CreateCardDialog
            columnId={column.id}
            boardId={boardId}
            members={members}
            labels={labels}
            onAddCard={onAddCard}
          >
            <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-400">
              <Plus className="w-4 h-4 mr-2" />
              Add a card
            </Button>
          </CreateCardDialog>
        </CardContent>
      </Card>
    </div>
  )
}
