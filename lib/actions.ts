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
  
  if (fetchError) {
    console.error("Error fetching profile:", fetchError)
    // If it's a "not found" error, we can still proceed with upsert
  }

  if (!profile?.invite_code) {
    const code = 'RES-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // First, try a direct update since we know the row likely exists (from the DB screenshot)
    const { data: updatedData, error: updateError } = await supabase
      .from('profiles')
      .update({ invite_code: code })
      .eq('id', user.id)
      .select('invite_code')
      .single()

    if (updateError) {
      console.warn("Update failed, trying upsert:", updateError.message)
      // If update fails, try upsert
      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, invite_code: code }, { onConflict: 'id' })
        .select('invite_code')
        .maybeSingle()

      if (upsertError) {
        console.error("Failed to save invite code via upsert:", upsertError)
        return { error: `Database error: ${upsertError.message}` }
      }
      
      if (!upsertData?.invite_code) {
         return { error: "Database rejected the code (check RLS or triggers)." }
      }
      
      revalidatePath('/dashboard')
      return { code: upsertData.invite_code }
    }
    
    if (!updatedData?.invite_code) {
       return { error: "Update succeeded but returned no code. This suggests a trigger or RLS issue." }
    }

    revalidatePath('/dashboard')
    return { code: updatedData.invite_code }
  }
  
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
  return { success: true }
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
  return { success: true }
}
