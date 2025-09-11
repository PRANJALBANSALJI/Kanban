"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CreateColumnButtonProps {
  boardId: string
  onAddColumn: (column: any) => void
}

export function CreateColumnButton({ boardId, onAddColumn }: CreateColumnButtonProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    try {
      // Get current column count for position
      const { count } = await supabase
        .from("columns")
        .select("*", { count: "exact", head: true })
        .eq("board_id", boardId)

      const { data: column, error } = await supabase
        .from("columns")
        .insert({
          board_id: boardId,
          title: title.trim(),
          position: count || 0,
        })
        .select()
        .single()

      if (error) throw error

      onAddColumn({ ...column, cards: [] })
      setTitle("")
      setIsCreating(false)
    } catch (error) {
      console.error("Error creating column:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setTitle("")
    setIsCreating(false)
  }

  if (isCreating) {
    return (
      <div className="w-80 flex-shrink-0">
        <Card>
          <CardContent className="p-4">
            <Input
              placeholder="Enter column title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate()
                if (e.key === "Escape") handleCancel()
              }}
              autoFocus
            />
            <div className="flex items-center space-x-2 mt-3">
              <Button size="sm" onClick={handleCreate} disabled={!title.trim() || isLoading}>
                {isLoading ? "Adding..." : "Add Column"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-80 flex-shrink-0">
      <Button
        variant="ghost"
        className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        onClick={() => setIsCreating(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Column
      </Button>
    </div>
  )
}
