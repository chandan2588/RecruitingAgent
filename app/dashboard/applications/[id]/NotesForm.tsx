"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NotesFormProps {
  applicationId: string;
  initialNotes: string | null;
}

export default function NotesForm({ applicationId, initialNotes }: NotesFormProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("id", applicationId);
      formData.append("notes", notes);

      const response = await fetch(`/api/applications/${applicationId}/notes`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Notes saved successfully!");
        router.refresh();
      } else {
        const error = await response.text();
        setMessage(`Error: ${error}`);
      }
    } catch (error) {
      setMessage("Failed to save notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        name="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add notes about this candidate..."
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </button>
        {message && (
          <span className={`text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
