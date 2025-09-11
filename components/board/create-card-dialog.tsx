"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { auditLogger } from "@/lib/audit-logger"
import { useNotifications } from "@/hooks/use-notifications"

interface CreateCardDialogProps {
  columnId: string
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
  onAddCard: (columnId: string, card: any) => void
  children: React.ReactNode
}

export function CreateCardDialog({ columnId, boardId, members, labels, onAddCard, children }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>("none")
  const [dueDate, setDueDate] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const { createAssignmentNotification } = useNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Get current card count for position
      const { count } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("column_id", columnId)

      // Create card
      const { data: card, error: cardError } = await supabase
        .from("cards")
        .insert({
          column_id: columnId,
          title: title.trim(),
          description: description.trim() || null,
          assignee_id: assigneeId === "none" ? null : assigneeId,
          due_date: dueDate || null,
          created_by: user.id,
          position: count || 0,
        })
        .select(`
          *,
          profiles!cards_assignee_id_fkey(full_name, avatar_url)
        `)
        .single()

      if (cardError) throw cardError

      // Add labels to card
      if (selectedLabels.length > 0) {
        const { error: labelsError } = await supabase.from("card_labels").insert(
          selectedLabels.map((labelId) => ({
            card_id: card.id,
            label_id: labelId,
          })),
        )

        if (labelsError) throw labelsError
      }

      await auditLogger.logCardCreated(card.id, card.title, boardId, columnId)

      if (assigneeId !== "none" && assigneeId !== user.id) {
        const assignee = members.find((m) => m.profiles.email === assigneeId)
        if (assignee) {
          await createAssignmentNotification(
            assigneeId,
            card.title,
            user.user_metadata?.full_name || user.email || "Someone",
            boardId,
            card.id,
          )
        }
      }

      // Prepare card with labels for local state
      const cardWithLabels = {
        ...card,
        card_labels: selectedLabels.map((labelId) => ({
          labels: labels.find((l) => l.id === labelId)!,
        })),
      }

      onAddCard(columnId, cardWithLabels)

      // Reset form
      setTitle("")
      setDescription("")
      setAssigneeId("none")
      setDueDate("")
      setSelectedLabels([])
      setOpen(false)
    } catch (error) {
      console.error("Error creating card:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
            <DialogDescription>Add a new task card to this column.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter card title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
