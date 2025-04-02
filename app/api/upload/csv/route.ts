import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parse, ParseResult } from "papaparse";

interface Profile {
  timestamp: Date;
  email: string;
  gender: "MALE" | "FEMALE" | null;
  attendeeCount: number;
  transactionId: string;
  anubandhId: string | null;
  name: string;
  mobileNumber: string;
  dateOfBirth: string;
  birthTime: string;
  birthPlace: string;
  education: string;
  aboutSelf: string;
  maritalStatus: string;
  firstGotra: string;
  secondGotra: string;
  currentAddress: string;
  permanentAddress: string;
  complexion: string;
  height: string;
  bloodGroup: string;
  annualIncome: string;
  fatherName: string;
  fatherOccupation: string;
  fatherMobile: string;
  motherName: string;
  motherOccupation: string;
  motherTongue: string;
  brothersDetails: string;
  sistersDetails: string;
  partnerExpectations: string;
  expectedQualification: string;
  expectedIncome: string;
  ageRange: string;
  expectedHeight: string;
  preferredCity: string;
}

// Define types for operation results
interface ProfileOperationSuccess {
  success: true;
  profile: any;
}

interface ProfileOperationError {
  success: false;
  profile: Record<string, string>;
  error: string;
}

type ProfileOperationResult = ProfileOperationSuccess | ProfileOperationError;

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper function to standardize gender values - IMPROVED
function standardizeGender(rawGender: string): "MALE" | "FEMALE" | null {
  // console.log
  
  if (!rawGender) return null;
  
  const lowercaseValue = rawGender.toLowerCase().trim();
  // Check for common gender identifiers in both English and Marathi
  if (lowercaseValue.includes("स्त्री") || 
      lowercaseValue.includes("female") || 
      lowercaseValue === "f" || 
      lowercaseValue === "महिला") {
    return "FEMALE";
  } else if (lowercaseValue.includes("पुरुष") || 
           lowercaseValue.includes("male") || 
           lowercaseValue === "m" || 
           lowercaseValue === "पुरष") {
    return "MALE";
  }
  return null;
}

// Helper function to calculate attendee count from text
function calculateAttendeeCount(attendeeText: string): number {
  if (!attendeeText) return 0;
  
  // Check for specific pricing patterns
  if (attendeeText.includes("Rs.200") || (attendeeText.includes("मी स्वतः") && !attendeeText.includes("आणि"))) {
    return 1;
  } 
  if (attendeeText.includes("Rs.400") || attendeeText.includes("मी स्वतः आणि १ व्यक्ती") || attendeeText.includes("मी स्वतः आणि 1 व्यक्ती")) {
    return 2;
  }
  if (attendeeText.includes("Rs.600") || attendeeText.includes("मी स्वतः आणि 2 व्यक्ती")) {
    return 3;
  }
  
  // Check for Devanagari digits
  const devanagariDigits: Record<string, number> = {
    '०': 0, '१': 1, '२': 2, '३': 3, '४': 4, 
    '५': 5, '६': 6, '७': 7, '८': 8, '९': 9
  };
  
  // Look for Devanagari digits
  for (const [digit, value] of Object.entries(devanagariDigits)) {
    if (attendeeText.includes(digit)) {
      return attendeeText.includes("मी स्वतः") || attendeeText.toLowerCase().includes("myself")
        ? value + 1 // Add 1 for "myself"
        : value;
    }
  }
  
  // Try with Arabic numerals
  const numberMatches = attendeeText.match(/\d+/g);
  if (numberMatches && numberMatches.length > 0) {
    return attendeeText.includes("मी स्वतः") || attendeeText.toLowerCase().includes("myself")
      ? parseInt(numberMatches[0], 10) + 1
      : parseInt(numberMatches[0], 10);
  }
  
  // Default case: just "myself" with no numbers
  if (attendeeText.includes("मी स्वतः") || attendeeText.toLowerCase().includes("myself")) {
    return 1;
  }
  
  return 0;
}

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, " "); // Trim spaces and replace multiple spaces with a single space
}

function findKey(object: Record<string, string>, targetKey: string): string | undefined {
  const normalizedTarget = normalizeKey(targetKey);
  return Object.keys(object).find(key => normalizeKey(key) === normalizedTarget);
}


// Map CSV fields to database structure
function mapProfileFields(csvRow: Record<string, string>): Partial<Profile> {
  const genderKey = findKey(csvRow, "स्त्री / पुरुष (MALE / FEMALE)");
  const educationKey = findKey(csvRow, "शिक्षण ( Education)");

  // console.log("Gender key:",genderKey)
  const rawGender = genderKey ? csvRow[genderKey] : undefined;

  return {
    timestamp: new Date(csvRow["Timestamp"]),
    email: csvRow["Email Address"],
    gender: standardizeGender(rawGender as string),
    attendeeCount: calculateAttendeeCount(csvRow["तुम्ही किती लोक येणार आहेत ? (How many of you are coming?)"]),
    transactionId: csvRow["QR कोड स्कॅन करा व ट्रान्झेक्शन ID लिहा. Scan the QR code and enter the transaction ID."],
    anubandhId: csvRow["अनुबंध आयडी (Anubandh ID)"],
    name: csvRow["वधू - वराचे नाव (Name)"],
    mobileNumber: csvRow["मोबाईल नंबर (Mobile NO)"],
    dateOfBirth: csvRow["जन्म तारीख (Date Of Birth)"],
    birthTime: csvRow["जन्म वेळ (Birth Time)"],
    birthPlace: csvRow["जन्म ठिकाण (Birth Place)"],
    education: educationKey ? csvRow[educationKey] : undefined,
    aboutSelf: csvRow["स्वतः विषयी थोडक्यात माहिती. (Brief information about yourself)"],
    maritalStatus: csvRow["वैवाहिक स्थिती (Marital Status)"],
    firstGotra: csvRow["पहिले गोत्र (First gotra)"],
    secondGotra: csvRow["दुसरे गोत्र (Second gotra)"],
    currentAddress: csvRow["सध्याचा पत्ता (Current address)"],
    permanentAddress: csvRow["कायमचा पत्ता (Permanent Address)"],
    complexion: csvRow["वर्ण (Complexion)"],
    height: csvRow["उंची (Height)"],
    bloodGroup: csvRow["रक्तगट (Blood group)"],
    annualIncome: csvRow["(वार्षिक उत्पन्न) Annual Income"],
    fatherName: csvRow["वडिलांचे नाव (Father's Name)"],
    fatherOccupation: csvRow["वडिलांचा व्यवसाय (Fathers Occupation)"],
    fatherMobile: csvRow["वडिलांचा मोबाईल नंबर (Father's Mobile No)"],
    motherName: csvRow["आईचे नाव (Mother's name)"],
    motherOccupation: csvRow["आईचा व्यवसाय (Mother's Occupation)"],
    motherTongue: csvRow["मातृभाषा (Mother tongue)"],
    brothersDetails: csvRow["भावांची माहिती (Brothers details)"],
    sistersDetails: csvRow["बहिणींची माहिती (Sisters details)"],
    partnerExpectations: csvRow["जोडीदाराबद्दल अपेक्षा (Expectations about a partner)"],
    expectedQualification: csvRow["शिक्षण (Qualification)"],
    expectedIncome: csvRow["वार्षिक उत्पन्न अपेक्षा (Annual Income of Partner)"],
    ageRange: csvRow["वयोमर्यादा (Age Range)"],
    expectedHeight: csvRow["उंची (Hight)"],
    preferredCity: csvRow["पसंतीचे शहर (Preferred City)"],
  };
}

// Validate required fields - MODIFIED to not require anubandhId
function validateProfile(profile: Partial<Profile>): boolean {
  // Only check for name and mobile number
  return Boolean(profile.name) && Boolean(profile.mobileNumber);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // File validation
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "text/csv") {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }

    // Parse CSV content
    const fileContent = await file.text();
    const parseResult = parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim() // Clean header fields
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: "Error parsing CSV", details: parseResult.errors },
        { status: 400 }
      );
    }

    const profiles = parseResult.data as Record<string, string>[];
    const createdProfiles: any[] = [];
    const errors: {row?: Record<string, string>, error: string}[] = [];

    // Process profiles with batched database operations
    let tempAnubandhId = 99999; // Starting value
    const profileUpserts = profiles.map(async (profile) => {
      try {
      const mappedProfile = mapProfileFields(profile);
      
      // Skip profiles without required fields
      if (!validateProfile(mappedProfile)) {
        throw new Error("Missing required fields (name or mobile number)");
      }
      
      // Assign temporary anubandhId if not present or invalid
      if (!mappedProfile.anubandhId || isNaN(Number(mappedProfile.anubandhId))) {
        mappedProfile.anubandhId = tempAnubandhId.toString();
        tempAnubandhId--; // Decrease counter for next use
      }

      // Use upsert for all profiles
      const result = await prisma.profileCsv.upsert({
        where: { 
          anubandhId: mappedProfile.anubandhId as string
        },
        update: {
          ...mappedProfile,
          anubandhId: mappedProfile.anubandhId as string // Ensure anubandhId is string
        },
        create: mappedProfile as any,
      });
      return { success: true, profile: result } as ProfileOperationSuccess;
      } catch (error) {
      console.error("Error processing profile:", error);
      return { 
        success: false, 
        profile, 
        error: error instanceof Error ? error.message : "Unknown error" 
      } as ProfileOperationError;
      }
    });

    // Wait for all operations to complete
    const operationResults = await Promise.allSettled(profileUpserts);
    
    // Process results
    operationResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const value = result.value;
        if (value.success) {
          createdProfiles.push(value.profile);
        } else {
          errors.push({
            row: value.profile,
            error: value.error
          });
        }
      } else {
        errors.push({
          error: result.reason?.toString() || "Promise rejected"
        });
      }
    });

    // Return response with summary
    return NextResponse.json({
      success: true,
      message: `Processed ${createdProfiles.length} profiles with ${errors.length} errors`,
      processedCount: createdProfiles.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process upload", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma client is disconnected properly
    await prisma.$disconnect();
  }
}