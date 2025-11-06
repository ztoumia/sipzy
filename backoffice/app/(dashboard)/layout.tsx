import { AdminSidebarProvider } from '@/contexts/AdminSidebarContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { NavigationLoader } from '@/components/layout/NavigationLoader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSidebarProvider>
      {/* Global navigation loading bar */}
      <NavigationLoader />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
