'use server'

import { prisma } from "@/lib/prisma";

export async function getApprovalStatus(anubandhId: string) {
  try {
    if (!anubandhId) {
      throw new Error("Anubandh ID is required");
    }

    const user = await prisma.profileCsv.findUnique({
      where: { anubandhId },
      select: { 
        approvalStatus: true,
        attendeeCount: true,
        introductionStatus: true
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return { 
      approvalStatus: user.approvalStatus,
      attendeeCount: user.attendeeCount,
      introductionStatus: user.introductionStatus
    };
  } catch (error) {
    console.error("Error fetching approval status:", error);
    throw new Error("Failed to fetch approval status");
  }
} 