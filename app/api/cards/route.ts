import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { column_id, title, description, assignee_id, due_date } = body

    // Get current card count for position
    const { count } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("column_id", column_id)

    const { data: card, error } = await supabase
      .from("cards")
      .insert({
        column_id,
        title,
        description,
        assignee_id,
        due_date,
        created_by: user.id,
        position: count || 0,
      })
      .select(`
        *,
        profiles!cards_assignee_id_fkey(full_name, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(card)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
