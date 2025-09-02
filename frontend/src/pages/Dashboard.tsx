import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { Outlet } from "react-router-dom"

export default function Dashboard() {
  const role = useAuth().user?.role;
  return (
    <SidebarProvider>
      <AppSidebar className="bg-[#1877F2] text-white" />
      <SidebarInset className="bg-[#F0F2F5]">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#e0e0e0] px-4 bg-white shadow-sm">
          <SidebarTrigger className="-ml-1 text-[#1877F2] hover:bg-[#e8f0fe] rounded-lg p-2" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 bg-[#ddd]"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#" className="text-[#1877F2] font-medium">
                  {role === "APPLICANT" ? "Applicant" : "Interviewer"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-700 font-semibold">
                  Dashboard
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Body */}
        {/* Main Body renders sub-routes */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
