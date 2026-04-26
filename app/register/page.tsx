"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { VibrantPulse } from "@/components/vibrant-pulse"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      router.refresh()
      router.push(`/dashboard?name=${encodeURIComponent(fullName)}`)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0c0a09] relative overflow-hidden font-sans text-stone-50">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 250% 0; }
          100% { background-position: -250% 0; }
        }
      `}</style>
      {/* Dimmed Solar Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#451a03]/40 blur-[120px] animate-mesh-breathe" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#92400e]/30 blur-[120px] animate-mesh-breathe" style={{ animationDelay: '5s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#ea580c]/10 blur-[120px] animate-mesh-breathe" style={{ animationDelay: '10s' }} />
      </div>

      {/* Global Header */}
      <header className="absolute top-0 w-full z-50 flex items-center justify-between border-b border-stone-800/50 bg-[#0c0a09]/50 px-8 py-5 backdrop-blur-xl">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/')}>
          <VibrantPulse className="h-10 w-10 group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite]">Resonance</span>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md pointer-events-auto relative z-10 pt-20"
      >
        <Card className="border-stone-800/60 bg-stone-900/60 backdrop-blur-2xl shadow-2xl shadow-orange-950/20">
          <CardHeader className="space-y-4 text-center pb-8 pt-6">
            <div className="flex flex-col items-center justify-center gap-2">
               <VibrantPulse className="h-10 w-10 text-orange-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse" />
                <CardTitle className="text-3xl font-bold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite]">Resonance</span>
                  <span className="text-stone-100"> Sign Up</span>
                </CardTitle>
            </div>
            <CardDescription className="text-stone-400 text-base">
              Create an account to embrace deeper connections.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div className="space-y-2 text-left">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-stone-950 border-stone-800 text-white placeholder:text-stone-500 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-stone-950 border-stone-800 text-white placeholder:text-stone-500 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-stone-950 border-stone-800 text-white placeholder:text-stone-500 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button className="w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 h-12 text-base font-semibold shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] hover:from-orange-400 hover:to-amber-400 text-white border-0 transition-all duration-300" type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
              </Button>
              <div className="text-center text-sm text-stone-400">
                Already have an account?{" "}
                <Link href="/login" className="text-amber-500 hover:text-amber-400 hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
