"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { initInviteCode } from "@/lib/actions"
import { Loader2, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  initialCode?: string | null
}

export function ConnectionCodeCard({ initialCode }: Props) {
  const [code, setCode] = useState<string | null>(initialCode || null)
  const [loading, setLoading] = useState(!initialCode)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!code) {
      handleInit()
    }
  }, [])

  const handleInit = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await initInviteCode()
      if (result.error) {
        setError(result.error)
      } else if (result.code) {
        setCode(result.code)
      }
    } catch (err) {
      setError("Failed to initialize connection code.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 p-1 rounded-[1.5rem] transition-all duration-500 hover:border-amber-500/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-bold text-stone-200">Your Connection Code</CardTitle>
        <CardDescription className="text-stone-400 text-xs">Share this code with your partner to manually securely link your Resonance accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="flex items-center justify-between bg-stone-950/50 border border-white/5 rounded-xl p-4 backdrop-blur-sm group-hover:border-amber-500/20 transition-colors">
          {loading ? (
            <div className="flex items-center gap-2 text-amber-500/50 py-1">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-mono tracking-widest font-bold animate-pulse">SECURING CODE...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-1 w-full">
              <div className="text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Connection Error
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-[11px] italic">{error}</span>
                <Button variant="outline" size="sm" onClick={handleInit} className="h-7 px-3 text-[10px] border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800 rounded-lg">Retry</Button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-2xl font-mono tracking-widest font-bold text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">{code}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyToClipboard}
                className="text-stone-500 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                title="Copy Connection Code"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
