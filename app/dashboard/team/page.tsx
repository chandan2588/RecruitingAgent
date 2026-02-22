export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getTenantIdFromActiveOrg, isOrgAdmin } from "@/lib/tenant";

interface OrgMember {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
  role: string;
}

async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  try {
    const client = await clerkClient();
    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    return memberships.data.map((membership) => ({
      id: membership.publicUserData?.userId || membership.id,
      firstName: membership.publicUserData?.firstName || null,
      lastName: membership.publicUserData?.lastName || null,
      emailAddresses: [{ emailAddress: membership.publicUserData?.identifier || "" }],
      role: membership.role,
    }));
  } catch (error) {
    console.error("Error fetching org members:", error);
    return [];
  }
}

async function inviteMember(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const orgId = formData.get("orgId") as string;

  if (!email || !orgId) {
    throw new Error("Email and organization ID are required");
  }

  // Check if current user is admin
  const admin = await isOrgAdmin();
  if (!admin) {
    throw new Error("Only admins can invite members");
  }

  const client = await clerkClient();

  try {
    await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email,
      role: "org:member",
    });
  } catch (error) {
    console.error("Error inviting member:", error);
    throw new Error("Failed to send invitation");
  }

  redirect("/dashboard/team?success=invited");
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { clerkOrgId } = await getTenantIdFromActiveOrg();
  const session = await auth();
  const params = await searchParams;

  const members = await getOrgMembers(clerkOrgId);
  const admin = await isOrgAdmin();

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {params.success === "invited" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          Invitation sent successfully!
        </div>
      )}

      {/* Invite Form - Only for Admins */}
      {admin && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invite Team Member
          </h2>
          <form action={inviteMember} className="flex gap-4 items-end">
            <input type="hidden" name="orgId" value={clerkOrgId} />
            <div className="flex-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="colleague@example.com"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
            >
              Send Invite
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            Invited members will have recruiter access (org:member role).
          </p>
        </div>
      )}

      {!admin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          Only organization admins can invite new members.
        </div>
      )}

      {/* Members List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 p-6 border-b border-gray-200">
          Organization Members
        </h2>

        {members.length === 0 ? (
          <p className="p-6 text-gray-600">No members found.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {(member.firstName?.[0] || member.emailAddresses[0]?.emailAddress[0] || "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.firstName
                        ? `${member.firstName} ${member.lastName || ""}`.trim()
                        : member.emailAddresses[0]?.emailAddress}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.role === "org:admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {member.role === "org:admin" ? "Admin" : "Member"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          To manage organization settings, visit the{" "}
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Clerk Dashboard
          </a>
          .
        </p>
      </div>
    </div>
  );
}
