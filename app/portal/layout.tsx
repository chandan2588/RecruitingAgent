export const dynamic = "force-dynamic";

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Check if user is an org member (admin/member), redirect to dashboard
  if (session.orgRole === "org:admin" || session.orgRole === "org:member") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link href="/portal" className="text-xl font-bold text-gray-900">
                Recruiting Portal
              </Link>

              <nav className="hidden sm:flex items-center gap-6">
                <Link
                  href="/portal"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/portal/jobs"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Open Positions
                </Link>
                <Link
                  href="/portal/my-applications"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  My Applications
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
              href="/portal"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Home
            </Link>
            <Link
              href="/portal/jobs"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Jobs
            </Link>
            <Link
              href="/portal/my-applications"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              My Applications
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
