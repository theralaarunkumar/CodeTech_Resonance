import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavigationBar } from "@/components/navigation-bar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Star, CalendarDays } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function JourneyPage() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  
  if (!data?.user) {
    redirect("/login")
  }

  const displayName = data?.user?.user_metadata?.full_name || "there"
  
  const lastSignIn = data?.user?.last_sign_in_at
  let formattedTime = undefined
  if (lastSignIn) {
    const date = new Date(lastSignIn)
    formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Fetch past tasks where rating is not null for this user and their partner
  const { data: pastTasks } = await supabase
    .from('daily_tasks')
    .select('*')
    .or(`user_id.eq.${data.user.id},partner_id.eq.${data.user.id}`)
    .not('rating', 'is', null) // Tasks that have a rating assigned
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen flex-col bg-[#0c0a09] font-sans text-stone-50 relative overflow-hidden">
        {/* Mesh Gradient Background (Dark & Subtle) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#451a03]/20 blur-[120px] animate-mesh-breathe" />
        </div>
        
        <DashboardHeader userName={displayName} loginTime={formattedTime} />
        
        <main className="relative z-10 flex flex-1 flex-col items-center p-6 space-y-12 pb-32 max-w-4xl mx-auto w-full pt-16 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in duration-700">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-stone-200 to-stone-400">
                The Journey
              </h1>
              <p className="text-base text-stone-400 max-w-xl mx-auto font-light leading-relaxed">
                 A timeline of your shared experiences and growing connection.
              </p>
            </div>
            
            <div className="w-full space-y-10 relative before:absolute before:inset-0 before:ml-5 before:-transtone-x-px md:before:mx-auto md:before:transtone-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-[#f59e0b]/30 before:to-transparent">
               {pastTasks && pastTasks.length > 0 ? (
                 pastTasks.map((task) => {
                   const date = new Date(task.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                   return (
                      <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                         <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#f59e0b]/50 bg-stone-950 text-[#f59e0b] shadow shrink-0 md:order-1 md:group-odd:-transtone-x-1/2 md:group-even:transtone-x-1/2 relative z-10 shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform duration-300">
                               <CalendarDays className="w-5 h-5 text-[#f59e0b]" />
                          </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.03)] hover:shadow-[0_0_30px_rgba(245,158,11,0.08)] transition-all">
                             <div className="flex flex-col space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/10">
                                    {task.category}
                                  </span>
                                  <span className="text-xs text-stone-500 font-mono tracking-wide">{date}</span>
                                </div>
                                <h3 className="text-xl font-bold text-stone-200">{task.title}</h3>
                                {task.feedback_notes && (
                                   <div className="relative">
                                      <div className="absolute top-0 left-0 w-0.5 h-full bg-amber-500/30 rounded-full" />
                                      <p className="text-sm text-stone-400 italic pl-3 py-1 leading-relaxed">
                                        "{task.feedback_notes}"
                                      </p>
                                   </div>
                                )}
                                <div className="flex items-center gap-1.5 pt-1">
                                   {[1, 2, 3, 4, 5].map(star => (
                                     <Star key={star} className={`w-5 h-5 ${star <= (task.rating || 0) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-stone-700/50'}`} />
                                   ))}
                                </div>
                             </div>
                        </div>
                     </div>
                   )
                 })
               ) : (
                 <div className="text-center py-20 relative z-10 w-full flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                       <CalendarDays className="w-10 h-10 text-[#f59e0b]" />
                    </div>
                    <p className="text-stone-400 text-xl font-light">Your journey is waiting to be written.</p>
                    <p className="text-stone-500 mt-2">Complete your daily connections to start building your timeline.</p>
                 </div>
               )}
            </div>
            
        </main>
        
        {/* Navigation moved to DashboardHeader */}
    </div>
  )
}
