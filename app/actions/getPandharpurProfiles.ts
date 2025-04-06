'use server'

import { prisma } from "@/lib/prisma";

// Interface for PandharpurProfile data
export interface PandharpurProfileData {
  id: string;
  anubandhId: string;
  name: string;
  mobileNumber: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  birthTime: string;
  birthPlace: string;
  education: string;
  aboutSelf?: string;
  currentAddress: string;
  permanentAddress: string;
  photo?: string;
  firstGotra: string;
  secondGotra: string;
  annualIncome: string;
  attendeeCount: number;
  height: string;
  createdAt: string;
  updatedAt: string;
  approvalStatus: boolean;
  introductionStatus: boolean;
}

export async function getPandharpurProfiles() {
  try {
    const profiles = await prisma.pandharpurProfile.findMany({
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
        height: true,
        aboutSelf: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert dates to strings to match the expected type
    const formattedProfiles: PandharpurProfileData[] = profiles.map(profile => ({
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      aboutSelf: profile.aboutSelf || undefined,
      photo: profile.photo || undefined
    }));

    return {
      profiles: formattedProfiles,
      total: formattedProfiles.length
    };
  } catch (error) {
    console.error("Error fetching Pandharpur profiles:", error);
    throw new Error("Failed to fetch Pandharpur profiles");
  }
} 