// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create the profile in the database
    const profile = await prisma.profile.create({
      data: {
        anuBandhId: data.contractId,
        name: data.name,
        mobileNumber: data.mobileNumber,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        birthTime: data.birthTime,
        birthPlace: data.birthPlace,
        education: data.education,
        aboutYourself: data.aboutYourself,
        photo: data.photo, // Cloudinary URL
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.error("Error creating profile:", error);
    
    // Handle unique constraint errors (e.g., duplicate email or contractId)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `A profile with this ${error.meta?.target?.[0] || 'field'} already exists.` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}