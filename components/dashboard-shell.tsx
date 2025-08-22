"use client";

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MapPin, Calendar, CheckSquare, IndianRupee,
  Star, MessageCircle, Mail,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input  } from "@/components/ui/input"
import AvatarMenu from "@/components/avatar-menu"

interface ShellProps { children: ReactNode }

const items = [
  { icon: MapPin,       label: "Trips",           href: "/trips" },
  { icon: Mail,         label: "Invites",         href: "/invites" },
  { icon: Calendar,     label: "Itineraries",     href: "/itineraries" },
  { icon: CheckSquare,  label: "Checklist",       href: "/checklist" },
  { icon: IndianRupee,  label: "Expense Tracker", href: "/expenses" },
  { icon: Star,         label: "Recommendations", href: "/recommendations" },
  { icon: MessageCircle,label: "Feedback",        href: "/feedback" },
]

export default function DashboardShell({ children }: ShellProps) {
  const pathname            = usePathname()
  const [open, setOpen]     = useState(false)        // sidebar hover

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative">

      {/* ───── header (unchanged) ───── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link
            href="/dashboard"
            className="font-sans text-2xl font-black bg-gradient-to-r from-[#1e40af] to-[#06b6d4]
                       bg-clip-text text-transparent tracking-tight"
          >
            TripMate
          </Link>

          <div className="flex items-center space-x-4">
           

         
            <AvatarMenu />
          </div>
        </div>
      </header>

      {/* ───── sidebar + page body ───── */}
      <div className="flex">
        {/* sidebar (fixed so it’s always visible while scrolling) */}
        <aside
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)]
                      bg-background/95 backdrop-blur-sm border-r
                      transition-all duration-300 ease-in-out
                      ${open ? "w-64" : "w-16"}`}
        >
          <div className="p-4">
            {items.map(({ icon: Icon, label, href }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href} className="block relative">
                  {/* ❶ curved bracket indicator (collapsed + active) */}
                  {active && !open && (
                    <>
                      <span className="absolute -left-[1px] top-[6px] h-[18px] w-0.5 bg-[#1e40af] rounded-tr-full"/>
                      <span className="absolute -left-[1px] bottom-[6px] h-[18px] w-0.5 bg-[#1e40af] rounded-br-full"/>
                    </>
                  )}

                  <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg group transition-all
                                hover:bg-[#1e40af]/10
                                ${active && open ? "bg-[#1e40af]/10" : ""}`}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0
                                  ${active ? "text-[#1e40af]" : "text-muted-foreground"}
                                  group-hover:drop-shadow-[0_0_6px_rgba(30,64,175,0.6)]`}
                    />
                    <span
                      className={`text-sm font-medium transition-all duration-300
                                  ${open ? "opacity-100" : "opacity-0"}
                                  ${active ? "text-[#1e40af]" : ""}`}
                    >
                      {label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </aside>

        {/* main content shifts right when the sidebar is open */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out
                      ${open ? "ml-64" : "ml-16"} px-4 md:px-6 py-6`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
