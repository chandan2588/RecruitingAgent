export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

interface DonePageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ status?: string }>;
}

/**
 * Application submission completion page
 * Redirects to portal/my-applications for a unified candidate experience
 */
export default async function DonePage({
  params,
  searchParams,
}: DonePageProps) {
  const { status } = await searchParams;

  // Redirect to portal with appropriate status
  const redirectStatus = status === "already_applied" ? "already_applied" : "applied";
  redirect(`/portal/my-applications?status=${redirectStatus}`);
}
