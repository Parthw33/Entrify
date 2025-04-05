'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface PandharpurRegistrationData {
  anubandhId: string;
  name: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  birthTime: string;
  birthPlace: string;
  education: string;
  aboutSelf: string;
  currentAddress: string;
  permanentAddress: string;
  photo?: string;
  firstGotra: string;
  secondGotra: string;
  annualIncome: string;
  expectedIncome: string;
  attendeeCount: number;
  gender: string;
  maritalStatus: string;
  complexion: string;
  height: string;
  bloodGroup: string;
  fatherName: string;
  fatherOccupation: string;
  fatherMobile: string;
  motherName: string;
  motherOccupation: string;
  motherMobile: string;
  motherTongue: string;
  brothersDetails: string;
  sistersDetails: string;
  partnerExpectations: string;
  expectedQualification: string;
  ageRange: string;
  expectedHeight: string;
  preferredCity: string;
}

export async function registerPandharpurProfile(data: PandharpurRegistrationData) {
  try {
    // Validate required fields
    if (!data.anubandhId || !data.name || !data.mobileNumber || !data.email) {
      throw new Error("Missing required fields");
    }

    // Create the profile
    const profile = await prisma.pandharpurProfile.create({
      data: {
        anubandhId: data.anubandhId,
        name: data.name,
        mobileNumber: data.mobileNumber,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        birthTime: data.birthTime,
        birthPlace: data.birthPlace,
        education: data.education,
        aboutSelf: data.aboutSelf,
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress,
        photo: data.photo,
        firstGotra: data.firstGotra,
        secondGotra: data.secondGotra,
        annualIncome: data.annualIncome,
        expectedIncome: data.expectedIncome,
        attendeeCount: data.attendeeCount,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        complexion: data.complexion,
        height: data.height,
        bloodGroup: data.bloodGroup,
        fatherName: data.fatherName,
        fatherOccupation: data.fatherOccupation,
        fatherMobile: data.fatherMobile,
        motherName: data.motherName,
        motherOccupation: data.motherOccupation,
        motherMobile: data.motherMobile,
        motherTongue: data.motherTongue,
        brothersDetails: data.brothersDetails,
        sistersDetails: data.sistersDetails,
        partnerExpectations: data.partnerExpectations,
        expectedQualification: data.expectedQualification,
        ageRange: data.ageRange,
        expectedHeight: data.expectedHeight,
        preferredCity: data.preferredCity,
        timestamp: new Date(),
      },
    });

    // Revalidate the admin and dashboard pages
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      profile
    };
  } catch (error: any) {
    console.error("Error registering Pandharpur profile:", error);
    
    // Handle unique constraint errors (e.g., duplicate email or anubandhId)
    if (error.code === 'P2002') {
      throw new Error(`A profile already exists.`);
    }
    
    throw new Error(error.message || "Failed to register profile");
  }
} 