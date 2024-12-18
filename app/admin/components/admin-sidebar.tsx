"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Building2,
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Briefcase,
} from "lucide-react"
import Link from "next/link"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Admin Dashboard</h2>
          <div className="space-y-1">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Overview
              </Button>
            </Link>
            <Link href="/admin/leads">
              <Button variant="ghost" className="w-full justify-start">
                <ClipboardList className="mr-2 h-4 w-4" />
                Leads
              </Button>
            </Link>
            <Link href="/admin/jobs">
              <Button variant="ghost" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                Jobs
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Customers
              </Button>
            </Link>
            <Link href="/admin/company">
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Company
              </Button>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Settings</h2>
          <div className="space-y-1">
            <Link href="/admin/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                General
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 