"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditCardDialog } from "./edit-card-dialog"
import { CollaborativeCardIndicator } from "./collaborative-card-indicator"
import { Calendar, MoreHorizontal, Edit, Trash } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface PresenceState {
  user_id: string
  user_name: string
  avatar_url?: string
  cursor_position?: { x: number; y: number }
  current_card_id?: string
  status: "online" | "away"
}

interface KanbanCardProps {
  card: {
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
  onUpdateCard: (cardId: string, updates: any) => void
  onDeleteCard: (cardId: string) => void
}

export function KanbanCard({ card, members, labels, presenceState, onUpdateCard, onDeleteCard }: KanbanCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const supabase = createClient()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDeleteCard = async () => {
    try {
      const { error } = await supabase.from("cards").delete().eq("id", card.id)

      if (error) throw error

      onDeleteCard(card.id)
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  const assignee = members.find(
    (m) => m.profiles.email === card.assignee_id || card.profiles?.full_name === m.profiles.full_name,
  )

  const isOverdue = card.due_date && new Date(card.due_date) < new Date()

  return (
    <>
      <div className="relative group">
        <CollaborativeCardIndicator cardId={card.id} presenceState={presenceState} />

        <Card
          ref={setNodeRef}
          style={style}
          className={`cursor-pointer hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : ""}`}
          {...attributes}
          {...listeners}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{card.title}</h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Card
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteCard} className="text-red-600 dark:text-red-400">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Card
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {card.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{card.description}</p>
            )}

            {/* Labels */}
            {card.card_labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {card.card_labels.map((cardLabel) => (
                  <Badge
                    key={cardLabel.labels.id}
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: cardLabel.labels.color + "20", color: cardLabel.labels.color }}
                  >
                    {cardLabel.labels.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Due Date */}
                {card.due_date && (
                  <div
                    className={`flex items-center space-x-1 text-xs ${
                      isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(card.due_date), { addSuffix: true })}</span>
                  </div>
                )}
              </div>

              {/* Assignee */}
              {assignee && (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={assignee.profiles.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {assignee.profiles.full_name?.charAt(0) || assignee.profiles.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <EditCardDialog
        card={card}
        members={members}
        labels={labels}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateCard={onUpdateCard}
      />
    </>
  )
}
