import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { linkPartner } from "@/lib/actions"
import { VibrantPulse } from "@/components/vibrant-pulse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DailyConnectionCard } from "@/components/daily-connection-card"
import { PartnerLinkForm } from "@/components/partner-link-form"
import { ConnectionCodeCard } from "@/components/connection-code-card"
import { NavigationBar } from "@/components/navigation-bar"
import { WeeklyResonance } from "@/components/weekly-resonance"
import { VibeController } from "@/components/vibe-controller"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage({ searchParams }: { searchParams: { name?: string } }) {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  
  if (!data?.user && !searchParams.name) {
    redirect("/login")
  }

  const displayName = data?.user?.user_metadata?.full_name || searchParams.name || "there"
  const lastSignIn = data?.user?.last_sign_in_at
  let formattedTime = null
  if (lastSignIn) {
    const date = new Date(lastSignIn)
    formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Fetch or generate Profile Data
  let inviteCode = "Generating..."
  let partnerId = null
  let latestTask = null
  let streak = 0
  let recentTasksSummaries = ""
  let hasCompletedToday = false
  let userVibe = null
  let userIntensity = 50
  let partnerHasCheckedIn = false
  let partnerVibeRaw = null
  let pulseData: number[] = [3, 4, 3, 5, 4, 5, 5] // Baseline fallback
  let partnerFirstName = "Partner"
  
  if (data?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("invite_code, partner_id, personal_vibe, intensity_level")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile) {
      partnerId = profile.partner_id;
      userVibe = profile.personal_vibe;
      userIntensity = profile.intensity_level || 50;
      inviteCode = profile.invite_code;
    }

    if (partnerId) {
      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("personal_vibe, full_name")
        .eq("id", partnerId)
        .maybeSingle();
      partnerHasCheckedIn = !!partnerProfile?.personal_vibe;
      partnerVibeRaw = partnerProfile?.personal_vibe;
      const partnerName = partnerProfile?.full_name || "Partner";
      partnerFirstName = partnerName.split(' ')[0];

      const { data: allTasks } = await supabase
        .from("daily_tasks")
        .select("*")
        .or(`user_id.eq.${data.user.id},partner_id.eq.${data.user.id}`)
        .order("created_at", { ascending: false });

      if (allTasks && allTasks.length > 0) {
        const absoluteLatest = allTasks[0];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(absoluteLatest.created_at);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
          if (absoluteLatest.rating !== null) {
            hasCompletedToday = true;
            latestTask = null;
          } else {
            latestTask = absoluteLatest;
          }
        } else {
          latestTask = null;
        }

        const ratedTasks = allTasks.filter((t: any) => t.rating !== null);
        if (ratedTasks.length > 0) {
          let currentStreak = 0;
          let expectedDate = new Date(today);
          if (!hasCompletedToday) {
            expectedDate.setDate(expectedDate.getDate() - 1);
          }
          for (const rt of ratedTasks) {
            const d = new Date(rt.created_at);
            d.setHours(0, 0, 0, 0);
            if (d.getTime() === expectedDate.getTime()) {
              currentStreak++;
              expectedDate.setDate(expectedDate.getDate() - 1);
            } else if (d.getTime() < expectedDate.getTime()) {
              break;
            }
          }
          streak = currentStreak;
        }
        const top2Rated = ratedTasks.slice(0, 2);
        recentTasksSummaries = top2Rated.map((t: any) => `${t.title} (${t.category})`).join(", ");
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        pulseData = ratedTasks
          .filter((t: any) => new Date(t.created_at) > sevenDaysAgo)
          .map((t: any) => t.rating)
          .reverse();
        if (pulseData.length === 0) pulseData = [3, 4, 3, 5, 4, 5, 5];
      }
    }
  }

  // Optional extra fetch if partnerId exists but partnerProfile wasn't fully loaded
  if (partnerId && partnerFirstName === "Partner") {
    const { data: pProfile } = await supabase.from("profiles").select("full_name").eq("id", partnerId).maybeSingle();
    if (pProfile?.full_name) {
      partnerFirstName = pProfile.full_name.split(' ')[0];
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0c0a09] font-sans text-stone-50 relative overflow-hidden">
      {/* Mesh Gradient Background (Dark & Subtle) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-mesh-breathe transition-colors duration-1000",
          userVibe === 'Stressed' ? "bg-red-900/30" : 
          userVibe === 'Playful' ? "bg-amber-500/20" :
          userVibe === 'Relaxed' ? "bg-emerald-900/20" :
          userVibe === 'Low Energy' ? "bg-blue-900/20" : "bg-[#451a03]/20"
        )} />
        {userVibe && (
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t pointer-events-none transition-opacity duration-1000 opacity-20",
            userVibe === 'Stressed' ? "from-red-950/40" : 
            userVibe === 'Playful' ? "from-amber-950/40" :
            userVibe === 'Relaxed' ? "from-emerald-950/40" :
            userVibe === 'Low Energy' ? "from-blue-950/40" : "from-transparent"
          )} />
        )}
      </div>

      <DashboardHeader loginTime={formattedTime} userName={displayName} />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto flex-1 flex flex-row px-6 gap-4 h-full py-4 overflow-hidden animate-in fade-in zoom-in duration-700">
        
        {!partnerId ? (
          <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto items-center">
            <div className="text-center space-y-1 mb-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter leading-none text-white">
                Welcome to <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite]">Resonance</span>, {displayName}.
              </h1>
              <p className="text-xs sm:text-sm font-bold tracking-tight text-amber-200/90 max-w-lg mx-auto">
                 Your journey to deeper connections begins now. Ensure your partner is linked before continuing.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Column A */}
              <ConnectionCodeCard initialCode={inviteCode} />

              {/* Column B */}
              <Card className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 p-1 rounded-[1.5rem] transition-all duration-500 hover:border-amber-500/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <CardHeader className="py-4">
                  <CardTitle className="text-xl font-bold text-stone-200">Connect Partner</CardTitle>
                  <CardDescription className="text-stone-400 text-xs">Enter your partner's connection code to finalize your bond.</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <PartnerLinkForm />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-row flex-1 h-full w-full gap-4 overflow-hidden pt-4 pb-4">
            {/* Left Section: Intelligence & Pulse */}
            <div className="flex-1 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 flex flex-col items-center text-center space-y-6 overflow-y-auto scrollbar-hide transition-all duration-500 hover:border-amber-500/30 shadow-2xl h-full pb-44">
               <div className="w-full space-y-4">
                  <WeeklyResonance streak={streak} recentTasksSummaries={recentTasksSummaries} pulseData={pulseData} isCompact={true} showPulse={false} showStreak={true} showInsight={true} />
               </div>

               <div className="w-full space-y-1">
                 <p className="text-[11px] uppercase tracking-[0.2em] text-[#f59e0b] font-black">
                   YOUR PULSE
                 </p>
               </div>
               
               <div className="w-full flex-1 flex flex-col justify-start space-y-8">
                  <WeeklyResonance streak={streak} recentTasksSummaries={recentTasksSummaries} pulseData={pulseData} isCompact={true} showPulse={true} showStreak={false} showInsight={false} />
                  
                  {/* Partner Status */}
                  <div className="w-full space-y-3 px-1 pt-6 border-t border-white/5">
                     <p className="text-[11px] uppercase tracking-[0.2em] text-[#f59e0b] font-black text-left">Partner Analytics</p>
                     <div className="flex items-center gap-3 bg-white/[0.04] border border-white/5 p-3 rounded-2xl w-full transition-all hover:bg-white/[0.08]">
                       <div className={cn(
                         "w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]",
                         partnerHasCheckedIn 
                           ? (partnerVibeRaw === 'Stressed' ? 'text-red-500' :
                              partnerVibeRaw === 'Playful' ? 'text-amber-400' :
                              partnerVibeRaw === 'Relaxed' ? 'text-emerald-400' : 'text-blue-400')
                           : "text-stone-700"
                       )} />
                       <div className="text-left">
                          <p className="text-xs font-bold text-stone-200">
                            {partnerFirstName}
                          </p>
                          <p className="text-[10px] text-stone-500 font-medium">
                            {partnerHasCheckedIn ? "Ready to connect" : "Reflecting..."}
                          </p>
                       </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Middle Section: Today's Focus & Connection */}
            <div className="flex-1 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 flex flex-col space-y-8 overflow-y-auto scrollbar-hide transition-all duration-500 hover:border-amber-500/30 shadow-2xl h-full pb-44">
               <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 w-fit rounded-full mx-auto shadow-inner">
                  <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] animate-pulse" />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#a1a1aa] font-black">TODAY'S FOCUS</p>
               </div>

               <div className="flex-1 flex items-center justify-center pt-0">
                  <div className="w-full max-w-lg">
                    <DailyConnectionCard 
                      initialTask={latestTask} 
                      hasCompletedToday={hasCompletedToday} 
                      userVibe={userVibe} 
                      partnerHasCheckedIn={partnerHasCheckedIn}
                      partnerName={partnerFirstName}
                      userIntensity={userIntensity}
                    />
                  </div>
               </div>
            </div>

            {/* Right Section: Vibe Control & Preferences */}
            <div className="flex-1 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 flex flex-col space-y-8 overflow-y-auto scrollbar-hide shadow-2xl h-full pb-44 transition-all duration-500 hover:border-amber-500/30">
               <div className="space-y-4 flex-1">
                 <div className="w-full space-y-1 mb-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#f59e0b] font-black text-center">EMOTIONAL SETTING</p>
                    <div className="h-px w-8 bg-amber-500/20 mx-auto" />
                 </div>
                 <div className="w-full p-3 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                   <VibeController initialMood={userVibe} initialIntensity={userIntensity} isCompact={true} />
                 </div>
               </div>

               <div className="w-full pt-6 border-t border-white/5 mt-auto">
                 <p className="text-[11px] uppercase tracking-widest text-[#f59e0b] font-black mb-3 text-center">Connection Triage</p>
                 <Button asChild variant="outline" className="w-full rounded-2xl border-stone-800 bg-stone-900/50 text-stone-300 hover:bg-stone-800 transition-all text-sm h-12">
                   <Link href="/onboarding" className="flex items-center justify-center gap-2">
                     <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     Retake Vibe Check
                   </Link>
                 </Button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
