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
import { Outlet, useLocation, Link } from "react-router-dom"

// Define the type for the nameMap object
type PathNameMap = {
  [key: string]: string;
  'analytics': string;
  'create-interview': string;
  'my-applications': string;
  'book-slots': string;
  'dashboard': string;
};

// Function to format path segment for display
const formatBreadcrumbName = (path: string) => {
  const nameMap: PathNameMap = {
    'analytics': 'Analytics',
    'create-interview': 'Create Interview',
    'my-applications': 'My Applications',
    'book-slots': 'Book Slots',
    'dashboard': 'Dashboard'
  };
  
  // Use type assertion or check if the key exists
  if (path in nameMap) {
    return nameMap[path as keyof PathNameMap];
  }
  
  return path.charAt(0).toUpperCase() + path.slice(1);
};

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
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
                <BreadcrumbLink asChild>
                  <Link to="/dashboard" className="text-[#1877F2] font-medium">
                    {user?.role === "APPLICANT" ? "Applicant" : "Interviewer"}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-400" />
              
              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                
                return (
                  <BreadcrumbItem key={to}>
                    {index > 0 && <BreadcrumbSeparator className="text-gray-400" />}
                    {isLast ? (
                      <BreadcrumbPage className="text-gray-700 font-semibold">
                        {formatBreadcrumbName(value)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={to} className="text-[#1877F2] font-medium">
                          {formatBreadcrumbName(value)}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                );
              })}
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