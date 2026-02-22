export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromActiveOrg } from "@/lib/tenant";
import { ApplicationStage } from "@prisma/client";
import NotesForm from "./NotesForm";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getApplication(id: string, tenantId: string) {
  const application = await prisma.application.findFirst({
    where: { id, tenantId },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          location: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          isRemote: true,
        },
      },
      answers: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          questionKey: true,
          answerText: true,
          createdAt: true,
        },
      },
    },
  });

  return application;
}

async function updateStage(formData: FormData): Promise<void> {
  "use server";

  const id = formData.get("id") as string;
  const stage = formData.get("stage") as ApplicationStage;

  if (!id || !stage) {
    throw new Error("Missing required fields");
  }

  const { tenantId } = await getTenantIdFromActiveOrg();

  await prisma.application.updateMany({
    where: { id, tenantId },
    data: { stage },
  });

  revalidatePath(`/dashboard/applications/${id}`);
  redirect(`/dashboard/applications/${id}`);
}

async function updateNotes(formData: FormData): Promise<void> {
  "use server";

  const id = formData.get("id") as string;
  const notes = formData.get("notes") as string;

  if (!id) {
    throw new Error("Missing application id");
  }

  const { tenantId } = await getTenantIdFromActiveOrg();

  await prisma.application.updateMany({
    where: { id, tenantId },
    data: { notes: notes || null },
  });

  revalidatePath(`/dashboard/applications/${id}`);
  redirect(`/dashboard/applications/${id}`);
}

function getStageBadgeColor(stage: ApplicationStage): string {
  const colors: Record<ApplicationStage, string> = {
    NEW: "bg-gray-100 text-gray-800",
    SCREENED: "bg-blue-100 text-blue-800",
    SHORTLISTED: "bg-purple-100 text-purple-800",
    SCHEDULED: "bg-yellow-100 text-yellow-800",
    INTERVIEWED: "bg-orange-100 text-orange-800",
    OFFERED: "bg-pink-100 text-pink-800",
    HIRED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    DROPPED: "bg-gray-100 text-gray-600",
  };
  return colors[stage] || "bg-gray-100 text-gray-800";
}

function getScoreBreakdown(score: number) {
  return {
    experience: Math.min(30, Math.round(score * 0.3)),
    react: Math.min(30, Math.round(score * 0.3)),
    systemDesign: Math.min(20, Math.round(score * 0.2)),
    availability: Math.min(
      20,
      score -
        Math.min(30, Math.round(score * 0.3)) -
        Math.min(30, Math.round(score * 0.3)) -
        Math.min(20, Math.round(score * 0.2))
    ),
  };
}

const stages = Object.values(ApplicationStage);

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { tenantId } = await getTenantIdFromActiveOrg();
  const { id } = await params;

  const application = await getApplication(id, tenantId);

  if (!application) {
    notFound();
  }

  const scoreBreakdown = getScoreBreakdown(application.score);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Application Details
        </h1>
        <Link
          href="/dashboard/applications"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Applications
        </Link>
      </div>

      {/* Stage Update Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <form action={updateStage} className="flex items-center gap-4">
          <input type="hidden" name="id" value={application.id} />
          <label className="text-sm font-medium text-gray-700">
            Update Stage:
          </label>
          <select
            name="stage"
            defaultValue={application.stage}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            Save Stage
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Candidate Profile */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Candidate Profile
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Name:</span>
              <p className="font-medium text-gray-900">
                {application.candidate.fullName || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Email:</span>
              <p className="font-medium text-gray-900">
                {application.candidate.email || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Phone:</span>
              <p className="font-medium text-gray-900">
                {application.candidate.phone || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Location:</span>
              <p className="font-medium text-gray-900">
                {application.candidate.location || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Applied:</span>
              <p className="font-medium text-gray-900">
                {new Date(application.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Job Info & Score */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Job & Score
          </h2>
          <div className="space-y-3 mb-6">
            <div>
              <span className="text-sm text-gray-600">Position:</span>
              <p className="font-medium text-gray-900">
                {application.job.title}
              </p>
            </div>
            {application.job.location && (
              <div>
                <span className="text-sm text-gray-600">Location:</span>
                <p className="font-medium text-gray-900">
                  {application.job.location}
                  {application.job.isRemote && " (Remote)"}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-600">Current Stage:</span>
              <span
                className={`inline-block ml-2 px-2 py-1 rounded text-xs font-medium ${getStageBadgeColor(
                  application.stage
                )}`}
              >
                {application.stage}
              </span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-900 mb-3">
              Screening Score: {application.score}/100
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Experience</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(scoreBreakdown.experience / 30) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">
                    {scoreBreakdown.experience}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">React/Next</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(scoreBreakdown.react / 30) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">
                    {scoreBreakdown.react}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Design</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(scoreBreakdown.systemDesign / 20) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">
                    {scoreBreakdown.systemDesign}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Availability</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(scoreBreakdown.availability / 20) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">
                    {scoreBreakdown.availability}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Screening Answers
        </h2>
        {application.answers.length === 0 ? (
          <p className="text-gray-600">No answers submitted.</p>
        ) : (
          <div className="space-y-4">
            {application.answers.map((answer) => (
              <div
                key={answer.id}
                className="border-b border-gray-100 pb-4 last:border-0"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-1 capitalize">
                  {answer.questionKey.replace(/_/g, " ")}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {answer.answerText || "No answer"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
        <NotesForm applicationId={application.id} initialNotes={application.notes} />
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Application submitted</span>
            <span className="text-sm text-gray-500 ml-auto">
              {new Date(application.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Last updated</span>
            <span className="text-sm text-gray-500 ml-auto">
              {new Date(application.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
