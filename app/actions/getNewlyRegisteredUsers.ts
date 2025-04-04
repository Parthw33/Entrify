'use server'

import { prisma } from "@/lib/prisma";
import { Profile1 } from "@/app/admin/components/approvedProfileRow";

export async function getNewlyRegisteredUsers() {
  try {
    // Calculate date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const newUsers = await prisma.profileCsv.findMany({
      where: {
        createdAt: {
          gte: twoDaysAgo
        }
      },
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
        introductionStatus: true,
        firstGotra: true,
        secondGotra: true,
        annualIncome: true,
        expectedHeight: true,
        height: true,
        complexion: true,
        bloodGroup: true,
        maritalStatus: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert dates to strings to match the Profile1 type
    const formattedUsers: Profile1[] = newUsers.map(user => ({
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
      introductionStatus: user.introductionStatus || false,
      firstGotra: user.firstGotra || undefined,
      secondGotra: user.secondGotra || undefined,
      annualIncome: user.annualIncome || undefined,
      expectedHeight: user.expectedHeight || undefined
    }));

    return {
      users: formattedUsers,
      total: formattedUsers.length
    };
  } catch (error) {
    console.error("Error fetching newly registered users:", error);
    throw new Error("Failed to fetch newly registered users");
  }
} 