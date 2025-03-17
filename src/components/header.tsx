
import { useState } from "react"
import { HelpCircle, LayoutDashboard, LogOut, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { MobileNav } from "@/components/dashboard/mobile-nav"

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4 mx-auto">
        <div className="flex gap-6 md:gap-10">
          <div className="hidden items-center space-x-2 md:flex">
            <span className="hidden font-bold sm:inline-block">QiCard Analytics</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:flex">
            <Input type="search" placeholder="Search..." className="md:w-[300px] lg:w-[400px]" />
          </div>
        </div>
      </div>
    </header>
  )
}

