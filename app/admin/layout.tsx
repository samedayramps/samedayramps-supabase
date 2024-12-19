import { AdminHeader } from "./components/admin-header"
import { AdminSidebar } from "./components/admin-sidebar"
import { AdminMobileSidebar } from "./components/admin-mobile-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden border-r lg:block lg:w-72">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <AdminSidebar className="w-full" />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-50 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <AdminMobileSidebar />
            <AdminHeader />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 