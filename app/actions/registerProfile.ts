'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface RegistrationData {
  anubandhId: string;
  name: string;
  mobileNumber: string;
  email: string;
  dateOfBirth?: string;
  birthTime?: string;
  birthPlace?: string;
  education?: string;
  aboutSelf?: string;
  address?: string;
  photo?: string;
  firstGotra?: string;
  secondGotra?: string;
  annualIncome?: string;
  expectedIncome?: string;
  attendeeCount?: number;
  gender?: string;
}

export async function registerProfile(data: RegistrationData) {
  try {
    if (!data.anubandhId || !data.name || !data.mobileNumber || !data.email) {
      throw new Error("Missing required fields");
    }

    // Create the profile
    const profile = await prisma.profileCsv.create({
      data: {
        anubandhId: data.anubandhId,
        name: data.name,
        mobileNumber: data.mobileNumber,
        email: data.email,
        dateOfBirth: data.dateOfBirth || '',
        birthTime: data.birthTime || '',
        birthPlace: data.birthPlace || '',
        education: data.education || null,
        aboutSelf: data.aboutSelf || null,
        permanentAddress: data.address || '',
        currentAddress: data.address || '',
        photo: data.photo || null,
        firstGotra: data.firstGotra || null,
        secondGotra: data.secondGotra || null,
        annualIncome: data.annualIncome || null,
        expectedIncome: data.expectedIncome || null,
        attendeeCount: data.attendeeCount || 1,
        timestamp: new Date(),
        maritalStatus: '',
        gender: data.gender || null,
        // Adding required fields that might not be in the form
        transactionId: '',
        complexion: null,
        height: null,
        bloodGroup: null,
        fatherName: null,
        fatherOccupation: null,
        fatherMobile: null,
        motherName: null,
        motherOccupation: null,
        motherTongue: null,
        brothersDetails: null,
        sistersDetails: null,
        partnerExpectations: null,
        expectedQualification: null,
        ageRange: null,
        expectedHeight: null,
        preferredCity: null,
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
    console.error("Error registering profile:", error);
    
    // Handle unique constraint errors (e.g., duplicate email or anubandhId)
    if (error.code === 'P2002') {
      throw new Error(`A profile with this ${error.meta?.target?.[0] || 'field'} already exists.`);
    }
    
    throw new Error(error.message || "Failed to register profile");
  }
} 