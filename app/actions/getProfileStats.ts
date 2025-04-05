'use server'

import { prisma } from "@/lib/prisma";

export async function getProfileStats() {
  try {
    const totalProfiles = await prisma.profileCsv.count();
    const approvedProfiles = await prisma.profileCsv.count({
      where: { approvalStatus: true },
    });
    const pendingProfiles = totalProfiles - approvedProfiles;

    // Get approved profiles with attendee counts
    const approvedProfilesWithAttendees = await prisma.profileCsv.findMany({
      where: { approvalStatus: true },
      select: {
        attendeeCount: true,
        gender: true
      }
    });

    // Calculate total guest count for approved profiles
    const totalGuestCount = approvedProfilesWithAttendees.reduce(
      (sum, profile) => sum + (profile.attendeeCount || 1), 
      0
    );

    // Calculate guest counts by gender
    const maleGuestCount = approvedProfilesWithAttendees
      .filter(profile => profile.gender === "MALE")
      .reduce((sum, profile) => sum + (profile.attendeeCount || 1), 0);

    const femaleGuestCount = approvedProfilesWithAttendees
      .filter(profile => profile.gender === "FEMALE")
      .reduce((sum, profile) => sum + (profile.attendeeCount || 1), 0);

    return {
      total: totalProfiles,
      approved: approvedProfiles,
      pending: pendingProfiles,
      approvedFemaleStats: await prisma.profileCsv.count({
        where: { gender: "FEMALE", approvalStatus: true },
      }),
      approvedMaleStats: await prisma.profileCsv.count({
        where: { gender: "MALE", approvalStatus: true },
      }),
      totalFemaleStats: await prisma.profileCsv.count({
        where: { gender: "FEMALE" },
      }),
      totalMaleStats: await prisma.profileCsv.count({
        where: { gender: "MALE" },
      }),
      totalGuestCount,
      maleGuestCount,
      femaleGuestCount
    };
  } catch (error) {
    throw new Error("Failed to fetch profile stats");
  }
} 