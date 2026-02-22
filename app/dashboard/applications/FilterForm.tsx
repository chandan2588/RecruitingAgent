"use client";

import Link from "next/link";
import { ApplicationStage } from "@prisma/client";

interface FilterFormProps {
  filters: {
    jobId?: string;
    stage?: string;
    minScore?: number;
  };
  jobs: { id: string; title: string }[];
  stages: ApplicationStage[];
}

export default function FilterForm({ filters, jobs, stages }: FilterFormProps) {
  const handleChange = (name: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    window.location.href = `/dashboard/applications?${params.toString()}`;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <form className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job
          </label>
          <select
            name="jobId"
            defaultValue={filters.jobId || ""}
            onChange={(e) => handleChange("jobId", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage
          </label>
          <select
            name="stage"
            defaultValue={filters.stage || ""}
            onChange={(e) => handleChange("stage", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Score
          </label>
          <select
            name="minScore"
            defaultValue={filters.minScore?.toString() || ""}
            onChange={(e) => handleChange("minScore", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Score</option>
            <option value="80">80+ (Excellent)</option>
            <option value="60">60+ (Good)</option>
            <option value="40">40+ (Fair)</option>
          </select>
        </div>

        <div>
          <Link
            href="/dashboard/applications"
            className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-medium"
          >
            Clear Filters
          </Link>
        </div>
      </form>
    </div>
  );
}
