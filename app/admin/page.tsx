import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { ActiveBoards } from "@/components/admin/active-boards"
import { ConnectedUsers } from "@/components/admin/connected-users"
import { RecentActivity } from "@/components/admin/recent-activity"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin (for demo, we'll check if they're the first user or have admin email)
  const isAdmin = user.email?.includes("admin") || user.email === "admin@example.com"

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Fetch admin dashboard data
  const [{ data: boards }, { data: users }, { data: auditLogs }, { data: presence }] = await Promise.all([
    supabase
      .from("boards")
      .select(`
        *,
        profiles!boards_owner_id_fkey(full_name, email),
        board_members(count)
      `)
      .order("created_at", { ascending: false }),

    supabase.from("profiles").select("*").order("created_at", { ascending: false }),

    supabase
      .from("audit_logs")
      .select(`
        *,
        profiles!audit_logs_user_id_fkey(full_name, email),
        boards(title)
      `)
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("presence")
      .select(`
        *,
        profiles!presence_user_id_fkey(full_name, email),
        boards(title)
      `)
      .eq("status", "online"),
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage your Kanban platform</p>
        </div>

        <AdminStats boards={boards || []} users={users || []} auditLogs={auditLogs || []} presence={presence || []} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <ActiveBoards boards={boards || []} />
          <ConnectedUsers presence={presence || []} />
        </div>

        <div className="mt-8">
          <RecentActivity auditLogs={auditLogs || []} />
        </div>
      </main>
    </div>
  )
}
