import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Recruiting Agent
              </Link>
              
              <nav className="hidden sm:flex items-center gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Home
                </Link>
                <Link 
                  href="/dashboard/jobs" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Jobs
                </Link>
                <Link 
                  href="/dashboard/applications" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Applications
                </Link>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="flex justify-around py-3">
            <Link 
              href="/dashboard" 
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Home
            </Link>
            <Link 
              href="/dashboard/jobs" 
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Jobs
            </Link>
            <Link 
              href="/dashboard/applications" 
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Applications
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
