"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

export default function AvatarMenu() {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10">
          <User className="h-5 w-5 text-[#1e40af]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
