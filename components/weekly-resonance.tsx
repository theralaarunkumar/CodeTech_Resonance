"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Flame, Loader2 } from "lucide-react"
import { generateWeeklyInsight } from "@/lib/actions/ai"
import { cn } from "@/lib/utils"

interface Props {
  streak: number
  recentTasksSummaries: string
  pulseData?: number[]
  isCompact?: boolean
  showPulse?: boolean
  showStreak?: boolean
  showInsight?: boolean
}

export function WeeklyResonance({ 
  streak, 
  recentTasksSummaries, 
  pulseData = [3, 4, 3, 5, 4, 5, 5], 
  isCompact = false,
  showPulse = true,
  showStreak = true,
  showInsight = true
}: Props) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Ensure we have at least 7 points for a nice graph, padding with baseline if needed
  const displayData = pulseData.length >= 7 ? pulseData.slice(-7) : [...Array(7 - pulseData.length).fill(3), ...pulseData]
  
  const generatePath = () => {
    const width = 200;
    const height = 40;
    const padding = 5;
    const points = displayData.map((val, i) => {
      const x = (i / (displayData.length - 1)) * (width - padding * 2) + padding;
      const y = (displayData.length > 0) ? height - ((val / 5) * (height - padding * 2) + padding) : height/2;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  useEffect(() => {
    if (!recentTasksSummaries) return

    const today = new Date().toDateString()
    const storedCache = localStorage.getItem("resonance_insight_cache")
    let cachedData = null

    try {
      if (storedCache) cachedData = JSON.parse(storedCache)
    } catch (e) {
      // ignore parse error
    }

    if (cachedData && cachedData.date === today && cachedData.insight) {
      setInsight(cachedData.insight)
      return
    }

    // Otherwise generate
    const fetchInsight = async () => {
      setLoading(true)
      const res = await generateWeeklyInsight(recentTasksSummaries)
      if (res.insight) {
        setInsight(res.insight)
        localStorage.setItem("resonance_insight_cache", JSON.stringify({
          date: today,
          insight: res.insight
        }))
      }
      setLoading(false)
    }

    fetchInsight()
  }, [recentTasksSummaries])

  return (
    <div className="w-full flex inset-0 flex-col space-y-4">
      {/* Resonance Pulse Sparkline */}
      {showPulse && (
        <div className="w-full px-2 text-left">
          <div className="relative h-8 w-full flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none" className="overflow-visible">
              <path
                d={generatePath()}
                fill="none"
                stroke="url(#pulse-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              />
              <defs>
                <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}

      {/* Streak Indicator */}
      {showStreak && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: [1, 1.02, 1],
            boxShadow: [
              "0px 0px 5px rgba(245,158,11,0.05)",
              "0px 0px 15px rgba(245,158,11,0.3)",
              "0px 0px 5px rgba(245,158,11,0.05)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center justify-center gap-2 bg-stone-900/40 backdrop-blur-md border border-amber-500/10 rounded-xl py-2 px-4 w-full"
        >
           <motion.div
             animate={{ scale: [1, 1.2, 1] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
           >
             <Flame className="w-4 h-4 fill-current text-white/90" />
           </motion.div>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 text-sm font-black tracking-wide">
             {streak > 0 ? `${streak} Day Streak!` : "Start your streak!"}
           </span>
        </motion.div>
      )}

      {/* AI Insight Bubble */}
      {showInsight && (
        <AnimatePresence mode="wait">
          <motion.div 
            key={loading ? "loading" : "insight"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative overflow-hidden rounded-xl border border-amber-500/10 shadow-lg",
              isCompact ? "bg-amber-500/5 py-2 px-3" : "bg-[#0c0a09]/50 p-5"
            )}
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
              {isCompact ? (
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                   <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
              )}
              <div className="flex-1 text-center">
                {!isCompact && <h4 className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">AI REFLECTION</h4>}
                {loading ? (
                  <div className="flex items-center justify-center gap-2 text-stone-500 text-[10px] h-4">
                    <Loader2 className="w-3 h-3 animate-spin" /> ...
                  </div>
                ) : (
                  <p className={cn(
                    "text-stone-300 font-bold",
                    isCompact ? "text-[10px] leading-tight line-clamp-1" : "text-base leading-relaxed"
                  )}>
                    {insight || "You are building a strong foundation."}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
