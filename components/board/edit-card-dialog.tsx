"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface EditCardDialogProps {
  card: {
    id: string
    title: string
    description: string | null
    assignee_id: string | null
    due_date: string | null
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
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateCard: (cardId: string, updates: any) => void
}

export function EditCardDialog({ card, members, labels, open, onOpenChange, onUpdateCard }: EditCardDialogProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || "")
  const [assigneeId, setAssigneeId] = useState(card.assignee_id || "")
  const [dueDate, setDueDate] = useState(card.due_date ? new Date(card.due_date).toISOString().slice(0, 16) : "")
  const [selectedLabels, setSelectedLabels] = useState<string[]>(card.card_labels.map((cl) => cl.labels.id))
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setTitle(card.title)
    setDescription(card.description || "")
    setAssigneeId(card.assignee_id || "")
    setDueDate(card.due_date ? new Date(card.due_date).toISOString().slice(0, 16) : "")
    setSelectedLabels(card.card_labels.map((cl) => cl.labels.id))
  }, [card])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      // Update card
      const { error: cardError } = await supabase
        .from("cards")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          assignee_id: assigneeId || null,
          due_date: dueDate || null,
        })
        .eq("id", card.id)

      if (cardError) throw cardError

      // Update card labels
      // First, remove existing labels
      const { error: deleteLabelsError } = await supabase.from("card_labels").delete().eq("card_id", card.id)

      if (deleteLabelsError) throw deleteLabelsError

      // Then add new labels
      if (selectedLabels.length > 0) {
        const { error: insertLabelsError } = await supabase.from("card_labels").insert(
          selectedLabels.map((labelId) => ({
            card_id: card.id,
            label_id: labelId,
          })),
        )

        if (insertLabelsError) throw insertLabelsError
      }

      // Update local state
      const updatedCard = {
        ...card,
        title: title.trim(),
        description: description.trim() || null,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
        card_labels: selectedLabels.map((labelId) => ({
          labels: labels.find((l) => l.id === labelId)!,
        })),
      }

      onUpdateCard(card.id, updatedCard)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating card:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>Update the card details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter card title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assignee">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No assignee</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.profiles.email} value={member.profiles.email}>
                      {member.profiles.full_name || member.profiles.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Updating..." : "Update Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
