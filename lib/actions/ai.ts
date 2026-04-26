"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { GoogleGenAI } from "@google/genai"

export async function generateDailyTask() {
  const supabase = createClient()
  
  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }
  
  // 2. Fetch User Profile
  const { data: userProfile } = await supabase.from('profiles').select('partner_id').eq('id', user.id).single()
  if (!userProfile?.partner_id) return { error: "No partner linked" }
  
  // 3. Fetch Onboarding & Vibe Data
  const { data: userProfileData } = await supabase.from('profiles').select('personal_vibe, intensity_level').eq('id', user.id).single()
  const { data: userOnboarding } = await supabase.from('onboarding').select('*').eq('user_id', user.id).single()
  const { data: partnerOnboarding } = await supabase.from('onboarding').select('*').eq('user_id', userProfile.partner_id).single()
  
  // 3b. Fetch Past Feedback (Top 3 rated items)
  const { data: pastTasks } = await supabase
    .from('daily_tasks')
    .select('title, category, rating, feedback_notes')
    .eq('user_id', user.id)
    .not('rating', 'is', null)
    .order('created_at', { ascending: false })
    .limit(3)

  const feedbackString = pastTasks?.map(t => `${t.title} (${t.category}): ${t.rating}/5 ${t.feedback_notes || ''}`).join('; ') || 'No feedback yet'
  
  const user1Interests = userOnboarding?.interests?.join(', ') || 'spending time together'
  const user2Interests = partnerOnboarding?.interests?.join(', ') || 'having fun'
  
  const currentVibe = userProfileData?.personal_vibe || 'Neutral'
  const intensity = userProfileData?.intensity_level || 50
  const bandwidth = intensity < 33 ? 'Low Key/Restorative' : intensity < 66 ? 'Balanced' : 'High Energy/Active'

  // 3c. Calculate Streak for Day 3 Logic
  const { data: allRatedTasks } = await supabase
    .from('daily_tasks')
    .select('created_at')
    .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
    .not('rating', 'is', null)
    .order('created_at', { ascending: false });

  let currentStreak = 0;
  if (allRatedTasks && allRatedTasks.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - 1); // We are generating for today, so check from yesterday back

    for (const rt of allRatedTasks) {
      const d = new Date(rt.created_at);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === expectedDate.getTime()) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (d.getTime() < expectedDate.getTime()) {
        break;
      }
    }
  }
  const isMilestoneDay = currentStreak === 2; // Day 3 means they completed Day 1 and Day 2 (streak of 2)

  // 4. Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { error: "Gemini API key is not configured internally." }
  
  const ai = new GoogleGenAI({ apiKey })
  
  const prompt = `
Context: Partner A likes ${user1Interests}. Partner B likes ${user2Interests}. 
Current State: Personal Vibe is "${currentVibe}" and Relationship Bandwidth is "${bandwidth}".
Past Performance: ${feedbackString}.
Streak: ${currentStreak} consecutive days.

Task Guidance:
- ${isMilestoneDay ? 'CRITICAL: This is a MILESTONE DAY (Day 3). Generate a "Milestone Celebration" task. This should be a small ritual to celebrate their 3-day consistency (e.g., a special toast, a "high-five" tradition, or sharing a favorite memory from Day 1).' : 'General Daily Connection task.'}
- If Vibe is "Stressed" and Bandwidth is "Low Key/Restorative", prioritize "Healing/Service" tasks (e.g., foot rub, making tea, quiet presence).
- If Vibe is "Playful" and Bandwidth is "High Energy/Active", prioritize "Outdoor/Activity" tasks (e.g., spontaneous walk, dance-off, mini-adventure).
- Otherwise, bridge their interests while respecting the current bandwidth (${bandwidth}).

Return exactly ONE creative, low-friction daily activity.
Return ONLY a valid JSON object with EXACTLY these four keys: 
"title" (string, max 5 words), 
"category" (string, max 3 words), 
"description" (string, 1-2 sentences),
"ai_insight" (string, 1 short sentence explaining why this fits their current vibe/feedback ${isMilestoneDay ? 'and celebrates their milestone' : ''}).
No markdown blocks, just raw JSON.`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const outputString = response.text || ""
    const taskJson = JSON.parse(outputString)
    
    // 5. Save to database
    const { data: newTask, error: insertError } = await supabase.from('daily_tasks').insert({
      user_id: user.id,
      partner_id: userProfile.partner_id,
      title: taskJson.title,
      description: taskJson.description,
      category: taskJson.category,
      ai_insight: taskJson.ai_insight,
      is_completed: false
    }).select().single()

    if (insertError) {
      console.error("Supabase Insertion Error:", insertError)
      return { error: `Database Error: ${insertError.message}` }
    }

    revalidatePath('/dashboard')
    return { task: newTask, success: true }
    
  } catch (err: any) {
    console.error("Failed to generate task", err)
    return { error: "Failed to generate AI connection task." }
  }
}

export async function completeTask(taskId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not logged in" }

  const { error } = await supabase.from('daily_tasks').update({ is_completed: true }).eq('id', taskId)
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true }
}

export async function rateTask(taskId: string, rating: number, notes?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not logged in" }

  const updateData: any = { rating }
  if (notes !== undefined) {
    updateData.feedback_notes = notes
  }

  const { error } = await supabase.from('daily_tasks').update(updateData).eq('id', taskId)
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  revalidatePath('/journey')
  return { success: true }
}

export async function generateWeeklyInsight(taskSummaries: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { error: "Gemini API key is not configured internally." }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `Look at these last 2 relationship activities from their Journey history: "${taskSummaries}". Write exactly ONE welcoming, warm, and highly specific encouraging sentence (maximum 20 words) analyzing the balance of their activities. If they show variety (e.g., one 'Ritual' and one 'Fun'), you might say: "You’re building a balanced bond through both deep conversation and shared play—keep it up!". No markdown, quotes, emojis, or explanations.`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return { insight: response.text?.trim() || "You're consistently finding wonderful ways to connect." }
  } catch (err) {
    console.error("Failed to generate insight", err)
    return { insight: "You're consistently finding wonderful ways to connect." }
  }
}
