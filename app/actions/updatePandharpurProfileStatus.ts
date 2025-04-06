'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface UpdateStatusParams {
  anubandhId: string;
  attendeeCount?: number;
  introductionStatus?: boolean;
}

export async function updatePandharpurProfileStatus({
  anubandhId,
  attendeeCount,
  introductionStatus
}: UpdateStatusParams) {
  try {
    if (!anubandhId) {
      throw new Error("Anubandh ID is required");
    }

    // Find the profile
    const existingProfile = await prisma.pandharpurProfile.findUnique({
      where: { anubandhId },
    });

    if (!existingProfile) {
      throw new Error(`Profile with Anubandh ID ${anubandhId} not found`);
    }

    // Prepare the update data
    const updateData: any = {
      approvalStatus: true // Always set to true when this action is called
    };

    // Only include these fields if they are defined
    if (introductionStatus !== undefined) {
      updateData.introductionStatus = introductionStatus;
    }

    if (attendeeCount !== undefined) {
      updateData.attendeeCount = attendeeCount;
    }

    // Update the profile
    const updatedProfile = await prisma.pandharpurProfile.update({
      where: { anubandhId },
      data: updateData
    });

    // Revalidate pages that might show this data
    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return {
      success: true,
      profile: updatedProfile
    };
  } catch (error) {
    console.error("Error updating Pandharpur profile status:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update profile status");
  }
} 