'use server'

import { prisma } from "@/lib/prisma";
import { Profile1 } from "@/app/admin/components/approvedProfileRow";

export async function getIntroductionProfiles() {
  try {
    const introProfiles = await prisma.profileCsv.findMany({
      where: {
        introductionStatus: true,
        approvalStatus: true // Only get profiles that are approved
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
      orderBy: [
        { gender: 'asc' }, 
        { name: 'asc' } 
      ]
    });



    // Convert dates to strings to match the Profile1 type
    const formattedProfiles: Profile1[] = introProfiles.map(profile => ({
      ...profile,
      gender: profile.gender || undefined,
      education: profile.education || undefined,
      photo: profile.photo || undefined,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      dateOfBirth: profile.dateOfBirth || undefined,
      birthTime: profile.birthTime || undefined,
      birthPlace: profile.birthPlace || undefined,
      attendeeCount: profile.attendeeCount || 0,
      introductionStatus: profile.introductionStatus || false,
      firstGotra: profile.firstGotra || undefined,
      secondGotra: profile.secondGotra || undefined,
      annualIncome: profile.annualIncome || undefined,
      expectedHeight: profile.expectedHeight || undefined
    }));

    // Get counts by gender
    const maleCount = formattedProfiles.filter(p => p.gender === 'MALE').length;
    const femaleCount = formattedProfiles.filter(p => p.gender === 'FEMALE').length;

    return {
      profiles: formattedProfiles,
      total: formattedProfiles.length,
      maleCount,
      femaleCount
    };
  } catch (error) {
    console.error("Error fetching introduction profiles:", error);
    throw new Error("Failed to fetch introduction profiles");
  }
} 