"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateVibe(mood: string, intensity: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not logged in" }

  const { error } = await supabase.from('profiles').update({ 
    personal_vibe: mood,
    intensity_level: intensity,
    vibe_updated_at: new Date().toISOString()
  }).eq('id', user.id)

  if (error) {
    console.error("Error updating vibe:", error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
