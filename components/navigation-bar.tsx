"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map } from "lucide-react"

export function NavigationBar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "The Journey", href: "/journey", icon: Map },
  ]

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex md:hidden">
      <div className="flex items-center gap-2 p-2 rounded-full border border-white/5 bg-[#0c0a09]/60 backdrop-blur-xl shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                isActive 
                  ? "bg-amber-500/20 text-amber-500 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" 
                  : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
