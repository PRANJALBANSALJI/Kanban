import { createBrowserClient } from "@/lib/supabase/client"

interface AuditLogParams {
  action: string
  entityType: "board" | "column" | "card" | "user"
  entityId: string
  entityName?: string
  boardId?: string
  oldValues?: any
  newValues?: any
  metadata?: any
}

export class AuditLogger {
  private supabase = createBrowserClient()

  async log(params: AuditLogParams) {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) return

      const { error } = await this.supabase.from("audit_logs").insert({
        user_id: user.id,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        entity_name: params.entityName,
        board_id: params.boardId,
        old_values: params.oldValues,
        new_values: params.newValues,
        metadata: params.metadata,
      })

      if (error) {
        console.error("Error logging audit event:", error)
      }
    } catch (error) {
      console.error("Error logging audit event:", error)
    }
  }

  // Convenience methods for common actions
  async logBoardCreated(boardId: string, boardName: string) {
    await this.log({
      action: "board_created",
      entityType: "board",
      entityId: boardId,
      entityName: boardName,
      boardId,
    })
  }

  async logBoardUpdated(boardId: string, boardName: string, oldValues: any, newValues: any) {
    await this.log({
      action: "board_updated",
      entityType: "board",
      entityId: boardId,
      entityName: boardName,
      boardId,
      oldValues,
      newValues,
    })
  }

  async logCardCreated(cardId: string, cardTitle: string, boardId: string, columnId: string) {
    await this.log({
      action: "card_created",
      entityType: "card",
      entityId: cardId,
      entityName: cardTitle,
      boardId,
      metadata: { columnId },
    })
  }

  async logCardMoved(cardId: string, cardTitle: string, boardId: string, fromColumn: string, toColumn: string) {
    await this.log({
      action: "card_moved",
      entityType: "card",
      entityId: cardId,
      entityName: cardTitle,
      boardId,
      oldValues: { columnId: fromColumn },
      newValues: { columnId: toColumn },
    })
  }

  async logCardUpdated(cardId: string, cardTitle: string, boardId: string, oldValues: any, newValues: any) {
    await this.log({
      action: "card_updated",
      entityType: "card",
      entityId: cardId,
      entityName: cardTitle,
      boardId,
      oldValues,
      newValues,
    })
  }

  async logCardDeleted(cardId: string, cardTitle: string, boardId: string) {
    await this.log({
      action: "card_deleted",
      entityType: "card",
      entityId: cardId,
      entityName: cardTitle,
      boardId,
    })
  }

  async logColumnCreated(columnId: string, columnTitle: string, boardId: string) {
    await this.log({
      action: "column_created",
      entityType: "column",
      entityId: columnId,
      entityName: columnTitle,
      boardId,
    })
  }

  async logUserJoinedBoard(userId: string, userName: string, boardId: string) {
    await this.log({
      action: "user_joined_board",
      entityType: "user",
      entityId: userId,
      entityName: userName,
      boardId,
    })
  }
}

export const auditLogger = new AuditLogger()
