"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { saveOnboarding } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { VibrantPulse } from "@/components/vibrant-pulse"
import { Loader2 } from "lucide-react"

type OnboardingData = {
  communication: string
  expectations: string
  interests: string[]
}

const steps = [
  {
    id: "communication",
    title: "Communication Style",
    description: "How do you prefer to resolve conflicts or tension in your relationship?",
    options: [
      "Talk it out immediately",
      "Give me an hour to process, then talk",
      "I need a full day of space first",
      "Write it down in messages/letters"
    ]
  },
  {
    id: "expectations",
    title: "Relationship Expectations",
    description: "What resonates with you the most right now?",
    options: [
      "Focusing on deep emotional connection",
      "Building a fun, adventurous life together",
      "Establishing stability and quiet routines",
      "Focusing on mutual personal growth"
    ]
  },
  {
    id: "interests",
    title: "Shared Interests",
    description: "Which activities mentally recharge you? (Select all that apply)",
    options: [
      "Outdoor Adventures",
      "Cozy Nights In",
      "Creative Hobbies",
      "Social Gatherings",
      "Deep Conversations",
      "Fitness & Wellness"
    ]
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [data, setData] = useState<OnboardingData>({
    communication: "",
    expectations: "",
    interests: []
  })

  const handleSelectSingle = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectMultiple = (field: "interests", value: string) => {
    setData(prev => {
      const current = prev[field]
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) }
      } else {
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setLoading(true)
      setError(null)
      const result = await saveOnboarding(data)
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.push("/dashboard")
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const isNextDisabled = () => {
    if (currentStep === 0 && !data.communication) return true
    if (currentStep === 1 && !data.expectations) return true
    if (currentStep === 2 && data.interests.length === 0) return true
    return false
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0a09] font-sans text-stone-50 relative overflow-hidden p-6">
      {/* Solar Mesh Gradient Background & Lens Flare */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_30%_30%,rgba(253,230,138,0.08),transparent_40%)] animate-[spin_60s_linear_infinite] mix-blend-screen" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#451a03]/40 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#92400e]/30 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#ea580c]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex flex-col items-center justify-center mb-8 space-y-4">
          <div className="flex items-center justify-center rounded-2xl bg-amber-500/10 p-3 ring-1 ring-amber-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(245,158,11,0.2)]">
             <VibrantPulse className="h-10 w-10 text-amber-500" />
          </div>
          <p className="text-sm font-bold tracking-[0.2em] text-amber-500/80 uppercase">Vibe Check</p>
          <div className="flex gap-2 items-center">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                  idx <= currentStep ? "bg-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-stone-800/50"
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="border-amber-500/10 bg-white/5 backdrop-blur-xl relative overflow-hidden min-h-[400px] flex flex-col shadow-2xl rounded-[2rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              className="flex flex-col flex-1"
            >
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl font-extrabold tracking-tight text-stone-50">{steps[currentStep].title}</CardTitle>
                <CardDescription className="text-amber-200/70 text-base mt-2 font-medium">
                  {steps[currentStep].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-8 pb-8 flex flex-col justify-center">
                
                {error && (
                  <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400 text-center border border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {steps[currentStep].options.map((option) => {
                    const stepId = steps[currentStep].id
                    let isSelected = false
                    if (stepId === "communication") isSelected = data.communication === option
                    else if (stepId === "expectations") isSelected = data.expectations === option
                    else if (stepId === "interests") isSelected = data.interests.includes(option)

                    return (
                      <button
                        key={option}
                        onClick={() => {
                          if (stepId === "interests") {
                            handleSelectMultiple(stepId, option)
                          } else {
                            handleSelectSingle(stepId as any, option)
                          }
                        }}
                        className={`p-4 rounded-2xl text-left border transition-all duration-300 flex items-center group ${
                          isSelected 
                            ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-amber-50" 
                            : "bg-white/[0.02] border-white/5 text-stone-400 hover:border-amber-500/30 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className={`w-4 h-4 mr-3 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          isSelected ? "border-amber-400 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" : "border-stone-700 bg-stone-900/50"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
                        </div>
                        <span className="text-sm font-bold tracking-tight">{option}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </motion.div>
          </AnimatePresence>

          <CardFooter className="flex justify-between border-t border-white/5 bg-white/[0.02] p-6">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 0 || loading}
              className="rounded-full border-white/10 bg-transparent text-stone-400 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={isNextDisabled() || loading}
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 min-w-[140px] h-11 text-sm font-bold text-white border-0 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 transition-all duration-300"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : currentStep === steps.length - 1 ? "Complete Validation" : "Continue"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
