"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } finally {
      router.push("/login")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MapPin className="h-8 w-8 text-[#1e40af]" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-[#1e40af] to-[#3b82f6] bg-clip-text text-transparent">
                TripMate
              </span>
              <span className="text-xs text-muted-foreground -mt-1">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Navigation & User Menu */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-[#1e40af] hover:bg-[#1e40af]/10">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-[#1e40af] hover:bg-[#1e40af]/10">
              Analytics
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-[#1e40af] hover:bg-[#1e40af]/10">
              Users
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-[#1e40af] hover:bg-[#1e40af]/10">
              Providers
            </Button>
          </nav>

          {/* Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10 rounded-full">
                <User className="h-5 w-5 text-[#1e40af]" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">Admin User</p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                    admin@tripmate.com
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}