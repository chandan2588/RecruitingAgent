export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserAndTenant } from "@/lib/auth";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

async function getJob(id: string, tenantId: string) {
  const job = await prisma.job.findFirst({
    where: { id, tenantId },
  });
  return job;
}

async function updateJob(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const isRemote = formData.get("isRemote") === "on";

  if (!title.trim()) {
    throw new Error("Title is required");
  }

  const { tenantId } = await getCurrentUserAndTenant();

  await prisma.job.updateMany({
    where: { id, tenantId },
    data: {
      title,
      description: description || null,
      location: location || null,
      isRemote,
    },
  });

  revalidatePath(`/dashboard/jobs/${id}`);
  redirect("/dashboard/jobs");
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { tenantId } = await getCurrentUserAndTenant();
  const { id } = await params;
  const job = await getJob(id, tenantId);

  if (!job) {
    notFound();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/jobs"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Jobs
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h1>

      <form action={updateJob} className="space-y-5">
        <input type="hidden" name="id" value={job.id} />

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={job.title}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            defaultValue={job.location || ""}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. San Francisco, CA"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRemote"
            name="isRemote"
            defaultChecked={job.isRemote}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="isRemote"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Remote position
          </label>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={job.description || ""}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Job description..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
          >
            Save Changes
          </button>
          <Link
            href="/dashboard/jobs"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
