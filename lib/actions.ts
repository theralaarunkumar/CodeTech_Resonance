"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function initInviteCode() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "Not logged in" }

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('invite_code')
    .eq('id', user.id)
    .maybeSingle()
  
  if (fetchError) return { error: `Fetch error: ${fetchError.message}` }
  if (!profile?.invite_code) return { error: "Code not found. Please refresh." }
  
  return { code: profile.invite_code }
}

export async function linkPartner(formData: FormData) {
  const rawCode = formData.get('partnerCode') as string
  if (!rawCode) return { error: "Code is required" }
  
  const partnerCode = rawCode.trim()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not logged in" }

  // Find partner
  const { data: partner } = await supabase
    .from('profiles')
    .select('id, partner_id')
    .eq('invite_code', partnerCode.toUpperCase())
    .single()

  if (!partner) return { error: "Partner code not found" }
  if (partner.id === user.id) return { error: "You cannot link with yourself" }
  if (partner.partner_id) return { error: "Partner is already linked to someone else" }

  // Verify current user isn't already linked
  const { data: currentUserParams } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('id', user.id)
    .single()
    
  if (currentUserParams?.partner_id) {
     return { error: "You are already linked to a partner" }
  }

  // Update current user
  const { error: userError } = await supabase.from('profiles').update({ partner_id: partner.id }).eq('id', user.id)
  if (userError) return { error: `RLS Error updating your profile: ${userError.message}` }
  
  // Update partner
  const { error: partnerError } = await supabase.from('profiles').update({ partner_id: user.id }).eq('id', partner.id)
  if (partnerError) return { error: `RLS Error updating your partner's profile: ${partnerError.message}` }

  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
  return { success: true, redirect: '/onboarding' }
}

export async function saveOnboarding(data: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not logged in" }

  const { error } = await supabase.from('onboarding').upsert({
    user_id: user.id,
    communication_preference: data.communication,
    expectations: data.expectations,
    interests: data.interests,
    updated_at: new Date().toISOString()
  })

  if (error) return { error: error.message }

  // Initialize the profile vibe so the dashboard redirect is satisfied
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    personal_vibe: 'Relaxed', // Default starting point
    intensity_level: 50,
    vibe_updated_at: new Date().toISOString()
  }, { onConflict: 'id' })

  if (profileError) {
    console.error("Profile initialization failed:", profileError)
    return { error: `Profile Error: ${profileError.message}` }
  }

  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
  return { success: true }
}
