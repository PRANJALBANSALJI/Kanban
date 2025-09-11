import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createBrowserClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Keep backward compatibility by renaming the function
export function createSupabaseBrowserClient() {
  return createBrowserClient()
}

export function createClient() {
  return createBrowserClient()
}
