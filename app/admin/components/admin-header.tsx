"use client"

import { useRouter } from "next/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function AdminHeader() {
  return (
    <div className="flex flex-1 items-center justify-between gap-x-4">
      <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      <ThemeSwitcher />
    </div>
  )
} 