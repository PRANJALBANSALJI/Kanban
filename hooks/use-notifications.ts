import { createBrowserClient } from "@/lib/supabase/client"

interface CreateNotificationParams {
  userId: string
  type: "assignment" | "mention" | "board_change" | "due_date"
  title: string
  message: string
  boardId?: string
  cardId?: string
  data?: any
}

export function useNotifications() {
  const supabase = createBrowserClient()

  const createNotification = async (params: CreateNotificationParams) => {
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        board_id: params.boardId,
        card_id: params.cardId,
        data: params.data,
        read: false,
      })

      if (error) {
        console.error("Error creating notification:", error)
      }
    } catch (error) {
      console.error("Error creating notification:", error)
    }
  }

  const createAssignmentNotification = async (
    assigneeId: string,
    cardTitle: string,
    assignerName: string,
    boardId: string,
    cardId: string,
  ) => {
    await createNotification({
      userId: assigneeId,
      type: "assignment",
      title: "New Assignment",
      message: `${assignerName} assigned you to "${cardTitle}"`,
      boardId,
      cardId,
    })
  }

  const createMentionNotification = async (
    mentionedUserId: string,
    mentionerName: string,
    cardTitle: string,
    boardId: string,
    cardId: string,
  ) => {
    await createNotification({
      userId: mentionedUserId,
      type: "mention",
      title: "You were mentioned",
      message: `${mentionerName} mentioned you in "${cardTitle}"`,
      boardId,
      cardId,
    })
  }

  const createBoardChangeNotification = async (userId: string, action: string, itemName: string, boardId: string) => {
    await createNotification({
      userId,
      type: "board_change",
      title: "Board Update",
      message: `${action} "${itemName}"`,
      boardId,
    })
  }

  const createDueDateNotification = async (
    userId: string,
    cardTitle: string,
    dueDate: string,
    boardId: string,
    cardId: string,
  ) => {
    await createNotification({
      userId,
      type: "due_date",
      title: "Due Date Reminder",
      message: `"${cardTitle}" is due ${dueDate}`,
      boardId,
      cardId,
    })
  }

  return {
    createNotification,
    createAssignmentNotification,
    createMentionNotification,
    createBoardChangeNotification,
    createDueDateNotification,
  }
}
