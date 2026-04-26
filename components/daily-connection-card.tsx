"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { generateDailyTask, completeTask, rateTask } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, CheckCircle2, Star, Brain } from "lucide-react"

export type DailyTask = {
  id: string
  title: string
  description: string
  category: string
  ai_insight?: string
  is_completed: boolean
}

interface Props {
  initialTask: DailyTask | null
  hasCompletedToday?: boolean
  userVibe?: string | null
  partnerHasCheckedIn?: boolean
  partnerName?: string
  userIntensity?: number
}

export function DailyConnectionCard({ initialTask, hasCompletedToday = false, userVibe, partnerHasCheckedIn, partnerName = "Partner", userIntensity = 50 }: Props) {
  const [task, setTask] = useState<DailyTask | null>(initialTask)
  const [intensity, setIntensity] = useState<number>(userIntensity)
  const [loading, setLoading] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rating, setRating] = useState<number | null>(null)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (!task && hasCompletedToday) {
      const calculateTimeLeft = () => {
        const now = new Date()
        const midnight = new Date()
        midnight.setHours(24, 0, 0, 0)
        const diff = midnight.getTime() - now.getTime()
        if (diff <= 0) {
          setTimeLeft("00:00:00")
          // When the countdown hits zero, force a reload to unlock the new day's task
          window.location.reload()
          return
        }
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
      calculateTimeLeft()
      interval = setInterval(calculateTimeLeft, 1000)
    }
    return () => clearInterval(interval)
  }, [task, hasCompletedToday])

  const handleIntensityChange = (val: number) => {
    setIntensity(val)
  }

  const handleIntensityCommit = async () => {
    if (userVibe) {
      const { updateVibe } = await import("@/lib/actions/vibe")
      await updateVibe(userVibe, intensity)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    const res = await generateDailyTask()
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else if (res.task) {
      setTask(res.task)
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!task) return
    setCompleting(true)
    setError(null)
    
    // trigger confetti locally first for instant feedback!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#ea580c', '#ffffff']
    })

    const res = await completeTask(task.id)
    if (res.error) {
      setError(res.error)
      setCompleting(false)
    } else {
      setTask(prev => prev ? { ...prev, is_completed: true } : null)
      setCompleting(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!task || !rating) return
    setSubmittingRating(true)
    setError(null)

    const res = await rateTask(task.id, rating, note)
    if (res.error) {
      setError(res.error)
      setSubmittingRating(false)
    } else {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#fef3c7']
      })
      setSubmittingRating(false)
      setRatingSubmitted(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: "0px 0px 60px rgba(245,158,11,0.08)"
      }}
      className="w-full max-w-2xl mx-auto"
    >
    <Card className="border-amber-500/10 bg-[#0c0a09]/80 backdrop-blur-xl relative overflow-hidden w-full shadow-2xl">
      {/* Dynamic Background Glow based on state */}
      <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none transition-colors duration-1000 ${
        task?.is_completed 
        ? "from-emerald-500/10 to-transparent" 
        : task 
        ? "from-amber-500/10 to-orange-500/5" 
        : "from-stone-500/5 to-transparent"
      }`} />

      <CardHeader className="text-center relative z-10 pb-4 pt-6">
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2 text-stone-100">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Daily Connection
        </CardTitle>
        {/* Dashboard Sub-header Update */}
        <CardDescription className="text-sm font-medium text-stone-400 mt-1">
          The AI has synthesized your vibes. Ready to connect?
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 min-h-[160px] flex flex-col justify-center py-2">
        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400 text-center border border-red-500/20">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-4 py-8"
            >
              <div className="w-full max-w-md space-y-3 animate-pulse">
                <div className="h-6 bg-amber-500/20 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-stone-800/50 rounded w-1/4 mx-auto" />
                <div className="h-16 bg-stone-800/30 rounded w-full mt-4" />
              </div>
              <p className="text-sm text-amber-400 animate-pulse flex items-center gap-2 mt-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your dynamic...
              </p>
            </motion.div>
          ) : !task ? (
            hasCompletedToday ? (
              <motion.div
                key="completed-empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 px-6 text-center relative overflow-hidden rounded-3xl"
              >
                {/* Starry Night Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
                   <div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[80px] animate-mesh-breathe" />
                   <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[80px] animate-mesh-breathe" style={{ animationDelay: '4s' }} />
                   <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                   <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
                   <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-amber-300/30 rounded-full animate-ping" style={{ animationDuration: '5s' }} />
                </div>

                <div className="relative z-10 flex flex-col items-center w-full">
                  <div className="flex flex-col items-center justify-center mb-6 w-full">
                     <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 mb-2">NEXT GENERATION IN</span>
                     <span className="text-4xl sm:text-5xl font-mono font-black text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">{timeLeft || "--:--:--"}</span>
                  </div>
                  
                  <div className="w-24 h-24 rounded-full bg-stone-800/80 border border-stone-700/50 flex items-center justify-center mb-6 shadow-inner relative">
                    <span className="text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">🌙</span>
                  </div>
                  <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">Anticipating tomorrow...</h3>
                  <p className="text-stone-300 max-w-md text-base leading-relaxed font-light">
                     Your next evolution begins in <span className="font-bold text-amber-500">{timeLeft || "--:--"}</span>.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                {!userVibe ? (
                  <>
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Sparkles className="w-8 h-8 text-amber-500" />
                      </div>
                      {partnerHasCheckedIn && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute -top-2 -right-2 bg-amber-500 text-amber-950 text-[9px] font-black px-2 py-1 rounded-full shadow-lg"
                        >
                          READY
                        </motion.div>
                      )}
                    </div>
                      <h3 className="text-lg font-black text-white mb-1 tracking-tight">Checking resonance...</h3>
                    {partnerHasCheckedIn ? (
                      <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl mb-6 max-w-sm">
                        <p className="text-amber-200/90 text-[13px] font-bold">
                          ✨ {partnerName} is ready. Are you? <br />
                          <span className="text-stone-500 font-medium">Add your vibe to synchronize.</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-stone-500 mb-6 max-w-sm text-sm font-medium">Please share your vibe to begin today's connection.</p>
                    )}
                  </>
                ) : !partnerHasCheckedIn ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-stone-800/50 flex items-center justify-center mb-6 border border-stone-700/50">
                      <Loader2 className="w-6 h-6 text-stone-500 animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Waiting for {partnerName}...</h3>
                    <p className="text-stone-500 mb-6 max-w-xs text-sm">
                      Resonance will activate once {partnerName} registers their energy.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                      <Sparkles className="w-8 h-8 text-amber-950" />
                    </div>
                    <h2 className="text-xl font-black text-white mb-2 tracking-tight">Resonance Found.</h2>
                    <p className="text-stone-400 mb-8 max-w-xs text-base leading-relaxed font-medium">
                      Your energy is aligned. Reveal your personal ritual.
                    </p>
                    <Button 
                      onClick={handleGenerate} 
                      disabled={loading}
                      className="h-14 px-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Synthesize Daily Task"}
                    </Button>
                  </>
                )}

                {/* Intensity Slider at the bottom of the card - save space */}
                {userVibe && (
                   <div className="w-full mt-6 pt-6 border-t border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-stone-600 font-black">Relationship Bandwidth</p>
                        <span className="text-[10px] font-black text-amber-500">
                          {intensity < 33 ? 'Low Key' : intensity < 66 ? 'Balanced' : 'High Energy'}
                        </span>
                      </div>
                      <div className="relative h-6 flex items-center">
                        <div className="absolute inset-x-0 h-1 bg-stone-900 rounded-full overflow-hidden">
                           <motion.div 
                             className="h-full bg-gradient-to-r from-amber-600 to-amber-400" 
                             animate={{ width: `${intensity}%` }}
                           />
                        </div>
                        <input 
                          type="range" min="0" max="100" value={intensity}
                          onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
                          onMouseUp={handleIntensityCommit}
                          className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer z-10"
                        />
                         <motion.div 
                           className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] border border-amber-500 pointer-events-none"
                           animate={{ left: `calc(${intensity}% - 7px)` }}
                        />
                      </div>
                   </div>
                )}
              </motion.div>
            )
          ) : ratingSubmitted ? (
            <motion.div
               key="submitted-state"
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="flex flex-col items-center justify-center space-y-6 py-12 text-center"
            >
               <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                 <CheckCircle2 className="w-10 h-10 text-emerald-400" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-4xl font-black text-white tracking-tighter">Connection Synchronized.</h3>
                 <p className="text-emerald-400/80 font-bold tracking-tight text-lg">Your ritual has been archived in the Journey.</p>
               </div>
               
               <div className="pt-8 border-t border-white/5 w-full max-w-xs text-center">
                  <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Establishing Next Frequency</p>
                  <div className="text-4xl font-mono font-black text-amber-500/90 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                     {timeLeft || "23:59:59"}
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div
              key="task"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, transition: { duration: 0.4 } }}
              whileHover={{ rotateX: 5, rotateY: 5 }}
              style={{ perspective: 1000, willChange: "transform" }}
              className="flex flex-col items-center text-center w-full"
            >
               {/* 3D Flip Card Container */}
                <div 
                  className="relative w-full min-h-[260px] cursor-pointer"
                  onClick={() => !task.is_completed && setIsFlipped(!isFlipped)}
                >
                 <motion.div
                   initial={false}
                   animate={{ rotateY: isFlipped ? 180 : 0 }}
                   transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                   style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                   className="w-full h-full relative"
                 >
                   {/* Front Side */}
                   <div 
                     className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-amber-500/20 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.05)]"
                     style={{ backfaceVisibility: "hidden" }}
                   >
                     <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-4 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                       {task.category}
                     </span>
                     <h3 className="text-2xl font-bold text-white mb-3">{task.title}</h3>
                     <p className="text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
                       {task.description}
                     </p>
                     {!task.is_completed && (
                       <p className="text-[10px] text-stone-500 mt-6 uppercase tracking-widest font-bold flex items-center gap-2">
                         <Sparkles className="w-3 h-3" /> Click to reveal AI Insight
                       </p>
                     )}
                   </div>

                   {/* Back Side */}
                   <div 
                     className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 bg-amber-500/5 border border-amber-500/40 rounded-[2.5rem] shadow-[0_0_40px_rgba(245,158,11,0.15)]"
                     style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                   >
                     <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-6 flex items-center gap-2">
                        <Brain className="w-4 h-4" /> AI SYNTHESIS
                     </h4>
                     <p className="text-2xl font-medium text-stone-200 leading-relaxed italic max-w-lg">
                       "{task.ai_insight || "Based on your current resonance, this activity is perfectly timed to foster growth and equilibrium."}"
                     </p>
                     <p className="text-xs text-amber-500/50 mt-8 font-mono">
                       Tap to flip back
                     </p>
                   </div>
                 </motion.div>
               </div>
               
               {task.is_completed ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex flex-col items-center gap-4 mt-6 w-full"
                 >
                     <h4 className="text-2xl text-white font-medium bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent mb-4">How was this experience?</h4>
                     <div className="flex gap-3">
                       {[1, 2, 3, 4, 5].map((starValue) => (
                           <button 
                             key={starValue}
                             onClick={() => setRating(starValue)}
                             onMouseEnter={() => setHoveredStar(starValue)}
                             onMouseLeave={() => setHoveredStar(null)}
                             className="p-1 transition-all hover:scale-110 focus:outline-none"
                           >
                             <Star className={`w-10 h-10 ${
                               (hoveredStar ?? rating ?? 0) >= starValue 
                               ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' 
                               : 'text-stone-600/50 hover:text-stone-400'
                             } transition-all duration-300`} />
                           </button>
                       ))}
                     </div>
                     
                     <AnimatePresence>
                       {rating && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0, y: -10 }}
                           animate={{ opacity: 1, height: 'auto', y: 0 }}
                           exit={{ opacity: 0, height: 0 }}
                           className="flex flex-col items-center w-full max-w-sm mt-4 gap-4 overflow-hidden"
                         >
                            {!showNote ? (
                               <Button variant="ghost" onClick={() => setShowNote(true)} className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-full">
                                   <Sparkles className="w-4 h-4 mr-2" /> Add a note (optional)
                               </Button>
                            ) : (
                               <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="w-full">
                                 <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="What made it special? Or what could be better?"
                                    className="w-full bg-stone-900/80 border border-stone-700/50 rounded-xl p-4 text-stone-200 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none min-h-[90px] shadow-inner"
                                 />
                               </motion.div>
                            )}
                            <Button 
                              onClick={handleSubmitRating}
                              disabled={submittingRating}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-full h-12 mt-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02]"
                            >
                               {submittingRating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                               Submit Journey Entry
                            </Button>
                         </motion.div>
                       )}
                     </AnimatePresence>
                 </motion.div>
               ) : (
                  <Button 
                     onClick={handleComplete}
                     disabled={completing}
                     className="bg-stone-100 text-stone-950 hover:bg-white hover:scale-105 transition-all rounded-full px-12 h-14 text-md font-extrabold mt-12 shadow-[0_0_25px_rgba(255,255,255,0.3)] border-0"
                  >
                     {completing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                     {completing ? "Logging..." : "Complete Task"}
                  </Button>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
    </motion.div>
  )
}
