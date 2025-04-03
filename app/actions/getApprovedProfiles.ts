'use server'

import { prisma } from "@/lib/prisma";
import { Profile } from "@/app/admin/components/approvedProfileRow";

export async function getApprovedProfiles() {
  try {
    const profiles = await prisma.profileCsv.findMany({
      where: {
        approvalStatus: true
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
        createdAt: true,
        updatedAt: true,
        approvalStatus: true,
        attendeeCount: true,
        introductionStatus: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Convert dates to strings to match the Profile type
    const formattedProfiles: Profile[] = profiles.map(profile => ({
      ...profile,
      gender: profile.gender || '',  // Ensure gender is never null
      education: profile.education || '',  // Ensure education is never null
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      dateOfBirth: profile.dateOfBirth || undefined,
      birthTime: profile.birthTime || undefined,
      birthPlace: profile.birthPlace || undefined,
      attendeeCount: profile.attendeeCount || undefined,
      introductionStatus: profile.introductionStatus || false
    }));

    return {
      profiles: formattedProfiles,
      total: profiles.length
    };
  } catch (error) {
    console.error('Error fetching approved profiles:', error);
    throw new Error('Failed to fetch approved profiles');
  }
} 