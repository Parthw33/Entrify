'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveUser(anubandhId: string) {
  try {
    if (!anubandhId) {
      throw new Error("Missing anubandh_id");
    }

    await prisma.profileCsv.update({
      where: { anubandhId },
      data: { approvalStatus: true },
    });

    // Revalidate the admin and dashboard pages
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error approving user:", error);
    throw new Error("Failed to approve user");
  }
} 