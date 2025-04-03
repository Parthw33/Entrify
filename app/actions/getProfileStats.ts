'use server'

import { prisma } from "@/lib/prisma";

export async function getProfileStats() {
  try {
    const totalProfiles = await prisma.profileCsv.count();
    const approvedProfiles = await prisma.profileCsv.count({
      where: { approvalStatus: true },
    });
    const pendingProfiles = totalProfiles - approvedProfiles;

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
    };
  } catch (error) {
    throw new Error("Failed to fetch profile stats");
  }
} 