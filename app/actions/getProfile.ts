'use server'

import { prisma } from "@/lib/prisma";

export interface Profile {
  id: string;
  anubandhId: string;
  name: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  birthTime: string | null;
  birthPlace: string | null;
  education: string | null;
  photo: string | null;
  createdAt: string;
  updatedAt: string;
  approvalStatus: boolean;
  attendeeCount: number | null;
  gender: string | null;
  introductionStatus: boolean | null;
}

export async function getProfile(anubandhId: string) {
  try {
    if (!anubandhId) {
      throw new Error("ID parameter is required");
    }

    const profile = await prisma.profileCsv.findUnique({
      where: { anubandhId },
      select: {
        id: true,
        anubandhId: true,
        name: true,
        mobileNumber: true,
        email: true,
        dateOfBirth: true,
        birthTime: true,
        birthPlace: true,
        education: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        approvalStatus: true,
        attendeeCount: true,
        gender: true,
        introductionStatus: true,
      },
    });

    if (!profile) {
      throw new Error("Anubandh Id not present");
    }

    return {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
} 