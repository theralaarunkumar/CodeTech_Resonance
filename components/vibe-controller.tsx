"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Coffee, Zap, Sparkles, Moon, Loader2 } from "lucide-react"
import { updateVibe } from "@/lib/actions/vibe"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MOODS = [
  { id: 'Relaxed', icon: Coffee, label: 'Relaxed', color: 'amber' },
  { id: 'Stressed', icon: Zap, label: 'Stressed', color: 'red' },
  { id: 'Playful', icon: Sparkles, label: 'Playful', color: 'gold' },
  { id: 'Low Energy', icon: Moon, label: 'Low Energy', color: 'blue' }
]

interface Props {
  initialMood?: string
  initialIntensity?: number
  isCompact?: boolean
}

export function VibeController({ initialMood, initialIntensity = 50, isCompact = false }: Props) {
  const [mood, setMood] = useState<string | undefined>(initialMood)
  const [intensity, setIntensity] = useState<number>(initialIntensity)
  const [saving, setSaving] = useState(false)

  const handleMoodSelect = async (selectedMood: string) => {
    setMood(selectedMood)
    await saveVibe(selectedMood, intensity)
  }

  const handleIntensityChange = async (val: number) => {
    setIntensity(val)
  }

  const handleIntensityCommit = async () => {
    if (mood) {
      await saveVibe(mood, intensity)
    }
  }

  const saveVibe = async (m: string, i: number) => {
    setSaving(true)
    await updateVibe(m, i)
    setSaving(false)
  }

  return (
    <div className="w-full space-y-8 p-1">
      {/* Mood Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Personal Vibe</p>
          {saving && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
        </div>
        
        <div className={cn(
          "grid gap-2",
          isCompact ? "grid-cols-2" : "grid-cols-4"
        )}>
          {MOODS.map((m) => {
            const Icon = m.icon
            const isActive = mood === m.id
            
            return (
              <motion.button
                key={m.id}
                onClick={() => handleMoodSelect(m.id)}
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(245,158,11,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl transition-all duration-300 border backdrop-blur-sm group",
                  isActive 
                    ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                )}
              >
                <Icon 
                  className={cn(
                    "w-4 h-4 transition-all duration-500",
                    isActive ? "text-amber-400 scale-110" : "text-stone-500 group-hover:text-stone-300"
                  )} 
                />
                <span className={cn(
                  "text-[9px] font-bold transition-colors",
                  isActive ? "text-amber-200" : "text-stone-600"
                )}>
                  {m.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Intensity Slider - Only show if NOT compact */}
      {!isCompact && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Relationship Bandwidth</p>
            <span className="text-[10px] font-mono text-amber-500/80 font-bold">
              {intensity < 33 ? 'Low Key' : intensity < 66 ? 'Balanced' : 'High Energy'}
            </span>
          </div>
          
          <div className="relative h-12 flex items-center px-2">
            {/* Custom Slider Track */}
            <div className="absolute inset-x-2 h-1.5 bg-stone-900 rounded-full border border-white/5 overflow-hidden">
               <motion.div 
                 className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                 initial={false}
                 animate={{ width: `${intensity}%` }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
               />
            </div>
            
            <input 
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
              onMouseUp={handleIntensityCommit}
              onTouchEnd={handleIntensityCommit}
              className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer z-10"
            />
            
            {/* Thumb Visual */}
            <motion.div 
               className="absolute w-5 h-5 bg-stone-100 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border-2 border-amber-500 pointer-events-none z-0"
               initial={false}
               animate={{ left: `calc(${intensity}% - 10px)` }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          
          <div className="flex justify-between px-1">
             <span className="text-[9px] text-stone-600 font-medium">Restorative</span>
             <span className="text-[9px] text-stone-600 font-medium">Adventure</span>
          </div>
        </div>
      )}
    </div>
  )
}
