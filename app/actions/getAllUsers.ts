'use server'

import { prisma } from "@/lib/prisma";
import { Profile1 } from "@/app/admin/components/approvedProfileRow";

export async function getAllUsers() {
  try {
    const allUsers = await prisma.profileCsv.findMany({
      select: {
        id: true,
        anubandhId: true,
        name: true,
        gender: true,
        mobileNumber: true,
        email: true,
        dateOfBirth: true,
        birthTime: true,
        birthPlace: true,
        education: true,
        photo: true,
        permanentAddress: true,
        currentAddress: true,
        attendeeCount: true,
        createdAt: true,
        updatedAt: true,
        approvalStatus: true,
        introductionStatus: true
      }
    });

    // Convert dates to strings to match the Profile1 type
    const formattedUsers: Profile1[] = allUsers.map(user => ({
      ...user,
      gender: user.gender || undefined,
      education: user.education || undefined,
      photo: user.photo || undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      dateOfBirth: user.dateOfBirth || undefined,
      birthTime: user.birthTime || undefined,
      birthPlace: user.birthPlace || undefined,
      attendeeCount: user.attendeeCount || 0,
      introductionStatus: user.introductionStatus || false
    }));

    return {
      allUsers: formattedUsers,
      total: allUsers.length
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
} 