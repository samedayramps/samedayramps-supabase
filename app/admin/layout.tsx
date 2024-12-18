import { AdminHeader } from "./components/admin-header"
import { AdminSidebar } from "./components/admin-sidebar"
import { AdminMobileSidebar } from "./components/admin-mobile-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-gray-100/40 lg:block lg:w-72">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <AdminSidebar className="w-full" />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-50 bg-white border-b">
          <div className="flex items-center">
            <AdminMobileSidebar />
            <AdminHeader />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
} 