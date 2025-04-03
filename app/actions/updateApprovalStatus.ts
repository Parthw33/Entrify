'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ApprovalData {
  anubandhId: string;
  attendeeCount?: number;
  introductionStatus?: boolean;
}

export async function updateApprovalStatus({ anubandhId, attendeeCount, introductionStatus }: ApprovalData) {
  try {
    if (!anubandhId) {
      throw new Error("Anubandh ID is required");
    }

    const updatedUser = await prisma.profileCsv.update({
      where: { anubandhId },
      data: { 
        approvalStatus: true,
        attendeeCount: attendeeCount || undefined,
        introductionStatus: introductionStatus || false
      },
    });

    // Revalidate the admin and dashboard pages
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { message: "User approved successfully", user: updatedUser };
  } catch (error) {
    console.error("Error updating approval status:", error);
    throw new Error("Failed to update approval status");
  }
} 