'use server'

import { prisma } from "@/lib/prisma";

// Interface for ProfileCsv data
export interface ProfileCsvData {
  id: string;
  anubandhId: string;
  name: string;
  mobileNumber: string;
  email: string;
  gender?: string;
  dateOfBirth: string;
  education?: string;
  currentAddress: string;
  attendeeCount?: number;
  approvalStatus: boolean;
  createdAt: string;
  updatedAt: string;
  selected?: boolean; // For UI selection tracking
}

export async function getAllProfileCsv() {
  try {
    const profiles = await prisma.profileCsv.findMany({
      select: {
        id: true,
        anubandhId: true,
        name: true,
        mobileNumber: true,
        email: true,
        gender: true,
        dateOfBirth: true,
        education: true,
        currentAddress: true,
        attendeeCount: true,
        approvalStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the profiles to match our interface
    const formattedProfiles: ProfileCsvData[] = profiles.map(profile => ({
      id: profile.id,
      anubandhId: profile.anubandhId,
      name: profile.name,
      mobileNumber: profile.mobileNumber,
      email: profile.email,
      gender: profile.gender || undefined,
      dateOfBirth: profile.dateOfBirth,
      education: profile.education || undefined,
      currentAddress: profile.currentAddress,
      attendeeCount: profile.attendeeCount || undefined,
      approvalStatus: profile.approvalStatus,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }));

    return {
      profiles: formattedProfiles,
      total: profiles.length
    };
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw new Error('Failed to fetch profiles');
  }
} 