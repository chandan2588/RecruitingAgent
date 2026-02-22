import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SelectOrgPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  // If user already has an active org, redirect to dashboard
  if (session.orgId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Select Organization</h1>
          <p className="mt-2 text-gray-600">
            You need to select an organization to access the dashboard.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <p className="text-gray-700 mb-4">
            Please use the organization switcher in the header, or contact your administrator to be added to an organization.
          </p>
          
          <div className="space-y-3">
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-medium"
            >
              Manage Organizations in Clerk
            </a>
            
            <Link
              href="/dashboard"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 font-medium"
            >
              Try Again
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
