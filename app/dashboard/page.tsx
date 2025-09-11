import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BoardGrid } from "@/components/dashboard/board-grid"
import { CreateBoardDialog } from "@/components/dashboard/create-board-dialog"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's boards
  const { data: boards } = await supabase
    .from("boards")
    .select(`
      *,
      board_members!inner(role),
      profiles!boards_owner_id_fkey(full_name, avatar_url)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Boards</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and organize your projects</p>
          </div>
          <CreateBoardDialog />
        </div>
        <BoardGrid boards={boards || []} />
      </main>
    </div>
  )
}
