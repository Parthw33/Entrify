import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalProfiles = await prisma.profileCsv.count();
    const approvedProfiles = await prisma.profileCsv.count({
      where: { approvalStatus: true },
    });
    const pendingProfiles = totalProfiles - approvedProfiles;

    return NextResponse.json({
      total: totalProfiles,
      approved: approvedProfiles,
      pending: pendingProfiles,
      approvedFemaleStats: await prisma.profileCsv.count({
        where: { gender: "FEMALE" , approvalStatus: true},
      }),
      approvedMaleStats: await prisma.profileCsv.count({
        where: { gender: "MALE" , approvalStatus: true},
      }),
      totalFemaleStats: await prisma.profileCsv.count({
        where: { gender: "FEMALE" },
      }),
      totalMaleStats: await prisma.profileCsv.count({
        where: { gender: "MALE" },
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 }
    );
  }
}
