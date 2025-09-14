import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { UserRole } from "@/lib/types"
import { Link, useLocation } from "react-router-dom"

// import icons
import {
  BarChart,
  PlusCircle,
  LinkIcon,
  FileText,
  Calendar,
  User,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Button } from "./ui/button"

const sidebarData: Record<UserRole, any> = {
  INTERVIEWER: {
    navMain: [
      {
        title: "Interviewer",
        url: "#",
        items: [
          { title: "Analytics", url: "/dashboard/analytics", icon: BarChart, default: true },
          { title: "Create Interview", url: "/dashboard/create-interview", icon: PlusCircle },
          { title: "Integrations", url: "/dashboard/integration", icon: LinkIcon },
          { title: "Profile", url: "/dashboard/profile", icon: User },
        ],
      },
    ],
  },
  APPLICANT: {
    navMain: [
      {
        title: "Applicant",
        url: "#",
        items: [
          { title: "My Applications", url: "/dashboard/my-applications", icon: FileText },
          { title: "Book Slots", url: "/dashboard/book-slots", icon: Calendar },
          { title: "Integrations", url: "/dashboard/integration", icon: LinkIcon },
          { title: "Profile", url: "/dashboard/profile", icon: User },
        ],
      },
    ],
  },
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [role, setRole] = React.useState<UserRole | null>(null)
  const location = useLocation()
  const { logout } = useAuth()

  React.useEffect(() => {
    const storedRole = localStorage.getItem("role") as UserRole | null
    if (storedRole === "INTERVIEWER" || storedRole === "APPLICANT") {
      setRole(storedRole)
    }
  }, [])

  if (!role) {
    return null
  }

  const data = sidebarData[role]

  return (
    <Sidebar
      {...props}
      className="bg-white border-r border-slate-200 text-slate-700 flex flex-col"
    >
      <SidebarContent className="p-2 flex-1">
        {data.navMain.map((group: any) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-2 py-1">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item: any) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          location.pathname === item.url
                            ? "bg-[#1877F2]/10 text-[#1877F2] font-medium"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.icon && (
                          <item.icon
                            className={`w-5 h-5 ${
                              location.pathname === item.url ? "text-[#1877F2]" : "text-slate-500"
                            }`}
                          />
                        )}
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md rounded-2xl shadow-2xl border border-slate-200 bg-white p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-slate-900">
                Are you sure you want to logout?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500">
                You will be signed out of your account and redirected to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex gap-3 mt-4">
              <AlertDialogCancel className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={logout}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 shadow-sm"
              >
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  )
}