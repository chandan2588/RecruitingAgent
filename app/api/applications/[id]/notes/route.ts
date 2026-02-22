import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromActiveOrg } from "@/lib/tenant";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has admin/member role
    if (!session.userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    if (session.orgRole !== "org:admin" && session.orgRole !== "org:member") {
      return new Response("Forbidden - Admin access required", { status: 403 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const notes = formData.get("notes") as string;

    const { tenantId } = await getTenantIdFromActiveOrg();

    await prisma.application.updateMany({
      where: { id, tenantId },
      data: { notes: notes || null },
    });

    return new Response("Notes updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating notes:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
