import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BoardHeader } from "@/components/board/board-header"
import { CollaborativeKanbanBoard } from "@/components/board/collaborative-kanban-board"

interface BoardPageProps {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Check if user has access to this board
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select(`
      *,
      board_members!inner(role, user_id),
      profiles!boards_owner_id_fkey(full_name, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (boardError || !board) {
    redirect("/dashboard")
  }

  // Check if user is a member of this board
  const isMember = board.owner_id === user.id || board.board_members.some((member: any) => member.user_id === user.id)

  if (!isMember) {
    redirect("/dashboard")
  }

  // Fetch columns and cards
  const { data: columns } = await supabase
    .from("columns")
    .select(`
      *,
      cards(
        *,
        profiles!cards_assignee_id_fkey(full_name, avatar_url),
        profiles!cards_created_by_fkey(full_name, avatar_url),
        card_labels(
          labels(*)
        )
      )
    `)
    .eq("board_id", id)
    .order("position")

  // Fetch board members
  const { data: members } = await supabase
    .from("board_members")
    .select(`
      *,
      profiles(full_name, avatar_url, email)
    `)
    .eq("board_id", id)

  // Fetch labels
  const { data: labels } = await supabase.from("labels").select("*").eq("board_id", id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BoardHeader board={board} members={members || []} currentUser={user} />
      <main className="p-6">
        <CollaborativeKanbanBoard
          boardId={id}
          columns={columns || []}
          members={members || []}
          labels={labels || []}
          currentUser={user}
        />
      </main>
    </div>
  )
}
