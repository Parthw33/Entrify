import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const id = url.searchParams.get("id")?.toString() ?? '';

  const profile = await prisma.profile.findUnique({
    where: {
      anuBandhId: id,
    },
    select: {
      id: true,
      anuBandhId: true,
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
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(profile);
}