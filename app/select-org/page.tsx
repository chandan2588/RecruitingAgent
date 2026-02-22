"use client";

import { useOrganizationList, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SelectOrgPage() {
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleSetActive = async (orgId: string) => {
    await setActive?.({ organization: orgId });
    router.push("/dashboard");
  };

  const memberships = userMemberships?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Select Organization</h1>
          <p className="mt-2 text-gray-600">
            Choose an organization to access your dashboard
          </p>
        </div>

        <div className="space-y-3">
          {memberships.length > 0 ? (
            memberships.map((membership) => (
              <button
                key={membership.organization.id}
                onClick={() => handleSetActive(membership.organization.id)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg">
                  {membership.organization.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {membership.organization.name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    Role: {membership.role.replace("org:", "")}
                  </p>
                </div>
                <span className="text-blue-600 text-sm font-medium">Select →</span>
              </button>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">You are not a member of any organization.</p>
              <a
                href="https://dashboard.clerk.com/last-active?path=organizations"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Create Organization in Clerk
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Signed in as {user.primaryEmailAddress?.emailAddress}
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
