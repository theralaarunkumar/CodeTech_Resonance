"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { VibrantPulse } from "@/components/vibrant-pulse"
import { Home, Map, User, LogOut, Settings } from "lucide-react"

export function DashboardHeader({ loginTime, userName }: { loginTime: string | null, userName: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "The Journey", href: "/journey", icon: Map },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 grid grid-cols-3 w-full items-center border-b border-stone-800/50 bg-[#0c0a09]/50 px-8 py-4 backdrop-blur-xl">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 250% 0; }
          100% { background-position: -250% 0; }
        }
      `}</style>
      <div className="flex items-center gap-4 group cursor-pointer justify-self-start" onClick={() => router.push('/dashboard')}>
        <VibrantPulse className="h-9 w-9 group-hover:scale-105 transition-transform" />
        <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite]">Resonance</span>
      </div>

      {/* Navigation Widget in the Middle */}
      <div className="flex items-center justify-self-center gap-1.5 p-1.5 rounded-full border border-white/5 bg-stone-900/40 backdrop-blur-xl shadow-inner">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${
                isActive 
                  ? "bg-amber-500/20 text-amber-500 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" 
                  : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
      
      <div className="flex items-center gap-4 justify-self-end">
        {loginTime && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite]">{userName}</span>
            <span className="text-[10px] font-medium text-stone-500 tracking-wider">Signed in at {loginTime}</span>
          </div>
        )}
        
        <div className="relative" ref={menuRef}>
          <button 
             onClick={() => setIsOpen(!isOpen)}
             className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${isOpen ? 'bg-stone-800 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-stone-900 border-stone-800 hover:border-amber-500/30 hover:bg-stone-800/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]'}`}
          >
            <User className={`h-5 w-5 ${isOpen ? 'text-amber-500' : 'text-stone-300'}`} />
          </button>
          
          <div className={`absolute right-0 top-full pt-3 transition-all duration-300 z-50 transform origin-top-right ${isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
            <div className="w-72 rounded-2xl bg-stone-900/95 backdrop-blur-xl border border-stone-800 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
              <div className="px-5 py-4 bg-stone-800/40 border-b border-stone-800/80">
                <p className="text-sm text-stone-400 mb-1">Signed in as</p>
                <p className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite] truncate">{userName}</p>
              </div>
              <div className="py-2">
                <Link 
                  href="/profile" 
                  className="flex items-center px-5 py-3 text-base font-medium text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors"
                  onClick={(e) => { setIsOpen(false); e.preventDefault(); }}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Profile Details
                </Link>
                <div className="mx-3 my-1 border-t border-stone-800/80"></div>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center px-5 py-3 text-base font-medium text-red-500 hover:bg-stone-800/60 hover:text-red-400 transition-colors text-left"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
