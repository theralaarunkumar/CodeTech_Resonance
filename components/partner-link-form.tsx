"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { linkPartner } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function PartnerLinkForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      const result = await linkPartner(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess("Connection established! Taking you to vibe check...")
        if (result.redirect) {
          router.push(result.redirect)
        } else {
          router.refresh()
        }
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={handleSubmit} className="flex gap-3 relative">
        <Input 
          name="partnerCode"
          placeholder="Enter Partner's Code (e.g. RES-XXXXXX)"
          className="bg-stone-950/50 border-white/10 text-white placeholder:text-stone-500 h-10 rounded-xl focus:border-amber-500/50 transition-all text-sm"
          required
          disabled={isPending}
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={isPending}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 h-10 shadow-[0_0_20px_rgba(245,158,11,0.2)] whitespace-nowrap min-w-[120px] rounded-xl font-bold transition-all hover:scale-105 text-sm"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Link Partner"}
        </Button>
      </form>
      
      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-md">
          {success}
        </div>
      )}
    </div>
  )
}
