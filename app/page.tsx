"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VibrantPulse } from "@/components/vibrant-pulse"
import { LogIn, Sparkles, Brain, Map } from "lucide-react"

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    }
  }

  const floatingAnimation = {
    y: [-5, 5, -5],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0c0a09] font-sans text-stone-50 selection:bg-orange-500/30 flex flex-col justify-between py-6">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 250% 0; }
          100% { background-position: -250% 0; }
        }
      `}</style>
      
      {/* Solar Mesh Gradient Background & Lens Flare */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_30%_30%,rgba(253,230,138,0.08),transparent_40%)] animate-[spin_60s_linear_infinite] mix-blend-screen" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#451a03]/40 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#92400e]/30 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#ea580c]/10 blur-[120px]" />
      </div>

      {/* Glassmorphic Header */}
      <header className="relative z-50 flex w-full items-center justify-between px-8 py-2">
        <div className="flex items-center gap-3 group cursor-pointer">
          <VibrantPulse className="h-8 w-8 group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite]">Resonance</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="group relative overflow-hidden bg-white/[0.03] border border-white/10 px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:border-transparent flex items-center gap-2"
          >
             <LogIn className="w-4 h-4 text-orange-400 group-hover:text-white transition-colors" />
             <span className="relative z-10">Sign In</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex w-full max-w-4xl flex-col items-center space-y-4"
        >
          <motion.div variants={item}>
            <motion.div
               animate={{ 
                 scale: [1, 1.04, 1],
                 filter: [
                   "drop-shadow(0px 0px 10px rgba(245,158,11,0.4))", 
                   "drop-shadow(0px 0px 20px rgba(245,158,11,0.7))", 
                   "drop-shadow(0px 0px 10px rgba(245,158,11,0.4))"
                 ] 
               }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="flex items-center justify-center p-3 rounded-full bg-amber-500/10 ring-1 ring-amber-500/20 backdrop-blur-sm"
            >
               <VibrantPulse className="h-8 w-8 text-amber-500" />
            </motion.div>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#fff,45%,#fde68a,55%,#fff)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite]">
                Your relationship, <br className="hidden sm:block" /> reimagined by AI.
              </span>
            </motion.h1>
            
            <motion.p variants={item} className="max-w-2xl mx-auto text-base sm:text-lg font-bold leading-relaxed text-amber-200/90">
              Experience a premium platform designed to nurture your relationships with adaptive, personalized daily engagements.
            </motion.p>
          </div>

          <motion.div variants={item} className="pt-2 flex flex-col gap-3 sm:flex-row items-center">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 h-12 text-sm font-bold shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-105 text-white border-0 transition-all duration-300">
              <Link href="/register">Start Your Journey</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-full px-8 h-12 text-sm font-medium text-stone-400 hover:text-white hover:bg-white/5 transition-all duration-300">
              <Link href="/login">Welcome Back</Link>
            </Button>
          </motion.div>
        </motion.div>
      </main>

      {/* Feature Section: Kinetic Paired Cards */}
      <div className="relative z-10 px-6 w-full max-w-5xl mx-auto">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div 
            variants={item}
            animate={floatingAnimation}
            whileHover={{ rotateX: 2, rotateY: 2, scale: 1.02 }}
            style={{ perspective: 1000 }}
            className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 rounded-[2rem] transition-all duration-500 hover:border-amber-500/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center text-center cursor-default"
          >
            <div className="mb-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Sparkles className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-sm font-bold text-stone-200 mb-1 tracking-tight">Personalized Prompts</h3>
            <p className="text-[11px] text-stone-500 leading-tight">AI-curated tasks that adapt to your unique bond and emotional sync.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={item}
            animate={{...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.2 }}}
            whileHover={{ rotateX: 2, rotateY: 2, scale: 1.02 }}
            style={{ perspective: 1000 }}
            className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 rounded-[2rem] transition-all duration-500 hover:border-amber-500/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center text-center cursor-default"
          >
            <div className="mb-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Brain className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-sm font-bold text-stone-200 mb-1 tracking-tight">Zero Cognitive Load</h3>
            <p className="text-[11px] text-stone-500 leading-tight">No planning required. Open Resonance, complete the task, and grow closer.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={item}
            animate={{...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.4 }}}
            whileHover={{ rotateX: 2, rotateY: 2, scale: 1.02 }}
            style={{ perspective: 1000 }}
            className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 rounded-[2rem] transition-all duration-500 hover:border-amber-500/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center text-center cursor-default"
          >
            <div className="mb-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Map className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-sm font-bold text-stone-200 mb-1 tracking-tight">Journey Milestones</h3>
            <p className="text-[11px] text-stone-500 leading-tight">Visualize your growth with a beautiful, shared timeline of experiences.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
