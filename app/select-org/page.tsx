"use client";

import { useOrganization, useUser, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SelectOrgPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { setActive } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (organization) {
      router.push("/dashboard");
    }
  }, [organization, router]);

  if (!userLoaded || !orgLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get organizations from user's organizationMemberships
  const memberships = user?.organizationMemberships || [];

  const handleSelect = async (orgId: string) => {
    await setActive({ organization: orgId });
    // Router will redirect via useEffect when org becomes active
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Select Organization
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Choose an organization to access your dashboard
        </p>

        {memberships.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              You are not a member of any organization yet.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Signed in as: {user?.emailAddresses[0]?.emailAddress}
            </p>
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create Organization →
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {memberships.map((membership) => (
              <button
                key={membership.organization.id}
                onClick={() => handleSelect(membership.organization.id)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  {membership.organization.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {membership.organization.id}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Role: {membership.role}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
