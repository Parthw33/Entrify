"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { z } from "zod";
import { registerPandharpurProfile } from "@/app/actions/registerPandharpurProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  User,
  Calendar,
  Clock,
  MapPin,
  Book,
  Home,
  Users,
  Plus,
  Minus,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Define validation schema with only specific fields required
const pandharpurRegistrationSchema = z.object({
  anubandhId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  mobileNumber: z
    .string()
    .regex(
      /^[987]\d{9}$/,
      "Mobile number must be 10 digits and start with 9, 8, or 7"
    ),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  gender: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  education: z.string().min(1, "Education is required"),
  aboutSelf: z.string().optional(),
  currentAddress: z.string().min(1, "Current address is required"),
  permanentAddress: z.string().optional(),
  firstGotra: z.string().min(1, "First gotra is required"),
  secondGotra: z.string().min(1, "Second gotra is required"),
  annualIncome: z.string().min(1, "Annual income is required"),
  expectedIncome: z.string().optional(),
  attendeeCount: z.number().min(1, "Attendee count is required"),
  photo: z.any().optional(),
  maritalStatus: z.string().optional(),
  complexion: z.string().optional(),
  height: z.string().min(1, "Height is required"),
  bloodGroup: z.string().optional(),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherMobile: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherMobile: z.string().optional(),
  motherTongue: z.string().optional(),
  brothersDetails: z.string().optional(),
  sistersDetails: z.string().optional(),
  partnerExpectations: z.string().optional(),
  expectedQualification: z.string().optional(),
  ageRange: z.string().optional(),
  expectedHeight: z.string().optional(),
  preferredCity: z.string().optional(),
});

interface FormData {
  anubandhId: string;
  name: string;
  mobileNumber: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  birthTime: string;
  birthPlace: string;
  education: string;
  aboutSelf: string;
  currentAddress: string;
  permanentAddress: string;
  firstGotra: string;
  secondGotra: string;
  annualIncome: string;
  expectedIncome: string;
  attendeeCount: number;
  photo: File | null;
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

const PandharpurRegistrationForm: React.FC = () => {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data with empty values
  const [formData, setFormData] = useState<FormData>({
    anubandhId: "",
    name: "",
    mobileNumber: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    birthTime: "",
    birthPlace: "",
    education: "",
    aboutSelf: "",
    currentAddress: "",
    permanentAddress: "",
    firstGotra: "",
    secondGotra: "",
    annualIncome: "",
    expectedIncome: "",
    attendeeCount: 1,
    photo: null,
    maritalStatus: "",
    complexion: "",
    height: "",
    bloodGroup: "",
    fatherName: "",
    fatherOccupation: "",
    fatherMobile: "",
    motherName: "",
    motherOccupation: "",
    motherMobile: "",
    motherTongue: "",
    brothersDetails: "",
    sistersDetails: "",
    partnerExpectations: "",
    expectedQualification: "",
    ageRange: "",
    expectedHeight: "",
    preferredCity: "",
  });

  // Form event handlers
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, photo: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttendeeCountChange = (value: number[]) => {
    const numValue = value[0];
    setFormData((prev) => ({ ...prev, attendeeCount: numValue }));
  };

  const incrementAttendeeCount = () => {
    if (formData.attendeeCount < 10) {
      setFormData((prev) => ({
        ...prev,
        attendeeCount: prev.attendeeCount + 1,
      }));
    }
  };

  const decrementAttendeeCount = () => {
    if (formData.attendeeCount > 1) {
      setFormData((prev) => ({
        ...prev,
        attendeeCount: prev.attendeeCount - 1,
      }));
    }
  };

  // Upload photo function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Failed to upload image");
    }
  };

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validationResult = pandharpurRegistrationSchema.safeParse(formData);
    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });
      setErrors(newErrors);
      setLoading(false);

      // Scroll to the first field with an error
      const firstErrorField = validationResult.error.errors[0]?.path[0];
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField as string);
        if (errorElement) {
          // Scroll the element into view with a small offset from the top
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });

          // Focus on the element
          errorElement.focus();
        }
      }

      return;
    }

    try {
      // Generate random 6-digit ID if anubandhId is not provided
      let submissionAnubandhId = formData.anubandhId;
      if (!submissionAnubandhId || submissionAnubandhId.trim() === "") {
        submissionAnubandhId = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        console.log("Generated random Anubandh ID:", submissionAnubandhId);
      }

      // Upload image to Cloudinary if photo exists
      let photoUrl = "";
      if (formData.photo) {
        photoUrl = await uploadToCloudinary(formData.photo);
      }

      // Use the server action to register the profile
      const result = await registerPandharpurProfile({
        anubandhId: submissionAnubandhId,
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        email: formData.email || "",
        gender: formData.gender || "",
        dateOfBirth: formData.dateOfBirth,
        birthTime: formData.birthTime || "",
        birthPlace: formData.birthPlace || "",
        education: formData.education,
        aboutSelf: formData.aboutSelf || "",
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress || "",
        photo: photoUrl,
        firstGotra: formData.firstGotra,
        secondGotra: formData.secondGotra,
        annualIncome: formData.annualIncome,
        expectedIncome: formData.expectedIncome || "",
        attendeeCount: formData.attendeeCount,
        maritalStatus: formData.maritalStatus || "",
        complexion: formData.complexion || "",
        height: formData.height,
        bloodGroup: formData.bloodGroup || "",
        fatherName: formData.fatherName || "",
        fatherOccupation: formData.fatherOccupation || "",
        fatherMobile: formData.fatherMobile || "",
        motherName: formData.motherName || "",
        motherOccupation: formData.motherOccupation || "",
        motherMobile: formData.motherMobile || "",
        motherTongue: formData.motherTongue || "",
        brothersDetails: formData.brothersDetails || "",
        sistersDetails: formData.sistersDetails || "",
        partnerExpectations: formData.partnerExpectations || "",
        expectedQualification: formData.expectedQualification || "",
        ageRange: formData.ageRange || "",
        expectedHeight: formData.expectedHeight || "",
        preferredCity: formData.preferredCity || "",
      });

      // Create QR data
      const qrDataObj = {
        id: submissionAnubandhId,
        name: formData.name,
        mobile: formData.mobileNumber,
        attendees: formData.attendeeCount,
      };

      // Convert to JSON string with minimal whitespace
      const qrDataString = JSON.stringify(qrDataObj);

      // Set data for displaying in UI
      setQrData(qrDataString);
      localStorage.setItem("pandharpurRegistrationData", qrDataString);
      setSubmitted(true);

      // Scroll to the top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Send email with QR code using API route instead of server action
      try {
        console.log("Attempting to send email with registration data");

        const emailRequestData = {
          email: formData.email,
          qrData: qrDataString,
          name: formData.name,
          anuBandhId: submissionAnubandhId,
          mobileNumber: formData.mobileNumber,
          address: formData.currentAddress,
          education: formData.education,
          attendeeCount: formData.attendeeCount.toString(),
        };

        console.log("Email request data:", emailRequestData);

        // Send email (email is now required)
        const response = await fetch("/api/send-pandharpur-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailRequestData),
        });

        console.log("API response status:", response.status);
        const emailResult = await response.json();
        console.log("API response data:", emailResult);

        if (!response.ok) {
          console.error("Email API returned error:", emailResult);
          toast.warning(
            "Registration successful but email could not be sent. Please take a screenshot of your QR code."
          );
        } else if (emailResult.success) {
          toast.success("Registration successful! QR code sent to your email.");
        } else {
          console.error("Email sending error:", emailResult.error);
          toast.warning(
            "Registration successful but email could not be sent. Please take a screenshot of your QR code."
          );
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        toast.warning(
          "Registration successful but email could not be sent. Please take a screenshot of your QR code."
        );
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                पंढरपूर विशेष नोंदणी फॉर्म / Pandharpur Registration Form
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                For Pandharpur residents only. Fields marked with{" "}
                <span className="text-red-500">*</span> are required.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Pandharpur Special
            </Badge>
          </div>
        </CardHeader>

        {/* Form implementation will be continued in the next sections */}
        {/* This is just the basic structure */}

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-yellow-800 font-medium">
                  This registration form is exclusively for Pandharpur
                  residents. Only fields marked with{" "}
                  <span className="text-red-500">*</span> are required.
                </p>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="p-3 mb-4 border border-red-200 rounded-md bg-red-50">
                  <p className="font-medium text-red-800">
                    Please fix the following errors:
                  </p>
                  <ul className="mt-2 text-sm list-disc pl-5 text-red-700">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>
                        <button
                          type="button"
                          className="text-left hover:underline focus:outline-none"
                          onClick={() => {
                            const element = document.getElementById(field);
                            if (element) {
                              element.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                              element.focus();
                            }
                          }}
                        >
                          {message}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anubandh ID */}
                <div className="space-y-2">
                  <Label htmlFor="anubandhId">अनुबंध आयडी (Anubandh ID)</Label>
                  <Input
                    id="anubandhId"
                    name="anubandhId"
                    value={formData.anubandhId}
                    onChange={handleInputChange}
                    placeholder="Enter Anubandh ID "
                  />
                  {errors.anubandhId && (
                    <p className="text-red-500 text-sm">{errors.anubandhId}</p>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    वधू - वराचे नाव (Name)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your Full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">स्त्री / पुरुष (Gender)</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">पुरुष (Male)</SelectItem>
                      <SelectItem value="FEMALE">स्त्री (Female)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm">{errors.gender}</p>
                  )}
                </div>

                {/* Marital Status */}
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">
                    वैवाहिक स्थिती (Marital Status)
                  </Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) =>
                      handleSelectChange("maritalStatus", value)
                    }
                  >
                    <SelectTrigger id="maritalStatus">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNMARRIED">
                        अविवाहित (Unmarried)
                      </SelectItem>
                      <SelectItem value="DIVORCED">
                        विभक्त (Divorced)
                      </SelectItem>
                      <SelectItem value="WIDOWED">
                        विधवा/विधुर (Widowed)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maritalStatus && (
                    <p className="text-red-500 text-sm">
                      {errors.maritalStatus}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">
                    मोबाईल नंबर (Mobile No)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setFormData((prev) => ({
                          ...prev,
                          mobileNumber: value,
                        }));
                      }
                    }}
                    maxLength={10}
                    placeholder="Enter your Mobile Number"
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    ईमेल (Email)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your Email Address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    <Calendar className="inline-block w-4 h-4 mr-1" />
                    जन्म तारीख (Date Of Birth)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>
                  )}
                </div>

                {/* Birth Time */}
                <div className="space-y-2">
                  <Label htmlFor="birthTime">
                    <Clock className="inline-block w-4 h-4 mr-1" />
                    जन्म वेळ (Birth Time)
                  </Label>
                  <Input
                    id="birthTime"
                    name="birthTime"
                    type="time"
                    value={formData.birthTime}
                    onChange={handleInputChange}
                  />
                  {errors.birthTime && (
                    <p className="text-red-500 text-sm">{errors.birthTime}</p>
                  )}
                </div>

                {/* Birth Place */}
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">
                    <MapPin className="inline-block w-4 h-4 mr-1" />
                    जन्म ठिकाण (Birth Place)
                  </Label>
                  <Input
                    id="birthPlace"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                    placeholder="Enter your birth place"
                  />
                  {errors.birthPlace && (
                    <p className="text-red-500 text-sm">{errors.birthPlace}</p>
                  )}
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <Label htmlFor="education">
                    <Book className="inline-block w-4 h-4 mr-1" />
                    शिक्षण (Education)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Enter your education details"
                  />
                  {errors.education && (
                    <p className="text-red-500 text-sm">{errors.education}</p>
                  )}
                </div>

                {/* First Gotra */}
                <div className="space-y-2">
                  <Label htmlFor="firstGotra">
                    पहिले गोत्र (First gotra)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstGotra"
                    name="firstGotra"
                    value={formData.firstGotra}
                    onChange={handleInputChange}
                    placeholder="Enter your first gotra"
                  />
                  {errors.firstGotra && (
                    <p className="text-red-500 text-sm">{errors.firstGotra}</p>
                  )}
                </div>

                {/* Second Gotra */}
                <div className="space-y-2">
                  <Label htmlFor="secondGotra">
                    दुसरे गोत्र (Second gotra)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="secondGotra"
                    name="secondGotra"
                    value={formData.secondGotra}
                    onChange={handleInputChange}
                    placeholder="Enter your second gotra"
                  />
                  {errors.secondGotra && (
                    <p className="text-red-500 text-sm">{errors.secondGotra}</p>
                  )}
                </div>

                {/* Physical attributes section */}
                <div className="space-y-2">
                  <Label htmlFor="height">
                    उंची (Height)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="e.g., 5 feet 6 inches"
                  />
                  {errors.height && (
                    <p className="text-red-500 text-sm">{errors.height}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complexion">वर्ण (Complexion)</Label>
                  <Select
                    value={formData.complexion}
                    onValueChange={(value) =>
                      handleSelectChange("complexion", value)
                    }
                  >
                    <SelectTrigger id="complexion">
                      <SelectValue placeholder="Select complexion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FAIR">गोरा (Fair)</SelectItem>
                      <SelectItem value="MEDIUM">सावळा (Medium)</SelectItem>
                      <SelectItem value="WHEATISH">
                        गहुवर्ण (Wheatish)
                      </SelectItem>
                      <SelectItem value="DARK">काळा (Dark)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.complexion && (
                    <p className="text-red-500 text-sm">{errors.complexion}</p>
                  )}
                </div>
              </div>

              {/* Family Information Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">
                  कौटुंबिक माहिती / Family Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Father's Information */}
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">
                      वडिलांचे नाव (Father{"'"}s Name)
                    </Label>
                    <Input
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Enter father's name"
                    />
                    {errors.fatherName && (
                      <p className="text-red-500 text-sm">
                        {errors.fatherName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatherOccupation">
                      वडिलांचा व्यवसाय (Father{"'"}s Occupation)
                    </Label>
                    <Input
                      id="fatherOccupation"
                      name="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={handleInputChange}
                      placeholder="Enter father's occupation"
                    />
                    {errors.fatherOccupation && (
                      <p className="text-red-500 text-sm">
                        {errors.fatherOccupation}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatherMobile">
                      वडिलांचा मोबाईल नंबर (Father{"'"}s Mobile)
                    </Label>
                    <Input
                      id="fatherMobile"
                      name="fatherMobile"
                      value={formData.fatherMobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setFormData((prev) => ({
                            ...prev,
                            fatherMobile: value,
                          }));
                        }
                      }}
                      maxLength={10}
                      placeholder="Enter father's mobile number"
                    />
                    {errors.fatherMobile && (
                      <p className="text-red-500 text-sm">
                        {errors.fatherMobile}
                      </p>
                    )}
                  </div>

                  {/* Mother's Information */}
                  <div className="space-y-2">
                    <Label htmlFor="motherName">
                      आईचे नाव (Mother{"'"}s Name)
                    </Label>
                    <Input
                      id="motherName"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother's name"
                    />
                    {errors.motherName && (
                      <p className="text-red-500 text-sm">
                        {errors.motherName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherOccupation">
                      आईचा व्यवसाय (Mother{"'"}s Occupation)
                    </Label>
                    <Input
                      id="motherOccupation"
                      name="motherOccupation"
                      value={formData.motherOccupation}
                      onChange={handleInputChange}
                      placeholder="Enter mother's occupation"
                    />
                    {errors.motherOccupation && (
                      <p className="text-red-500 text-sm">
                        {errors.motherOccupation}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherMobile">
                      आईचा मोबाईल नंबर (Mother{"'"}s Mobile)
                    </Label>
                    <Input
                      id="motherMobile"
                      name="motherMobile"
                      value={formData.motherMobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setFormData((prev) => ({
                            ...prev,
                            motherMobile: value,
                          }));
                        }
                      }}
                      maxLength={10}
                      placeholder="Enter mother's mobile number"
                    />
                    {errors.motherMobile && (
                      <p className="text-red-500 text-sm">
                        {errors.motherMobile}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherTongue">
                      मातृभाषा (Mother Tongue)
                    </Label>
                    <Input
                      id="motherTongue"
                      name="motherTongue"
                      value={formData.motherTongue}
                      onChange={handleInputChange}
                      placeholder="Enter mother tongue"
                    />
                    {errors.motherTongue && (
                      <p className="text-red-500 text-sm">
                        {errors.motherTongue}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brothersDetails">
                      भावांची माहिती (Brothers Details)
                    </Label>
                    <Textarea
                      id="brothersDetails"
                      name="brothersDetails"
                      value={formData.brothersDetails}
                      onChange={handleInputChange}
                      placeholder="Number of brothers and their details"
                      rows={2}
                    />
                    {errors.brothersDetails && (
                      <p className="text-red-500 text-sm">
                        {errors.brothersDetails}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sistersDetails">
                      बहिणींची माहिती (Sisters Details)
                    </Label>
                    <Textarea
                      id="sistersDetails"
                      name="sistersDetails"
                      value={formData.sistersDetails}
                      onChange={handleInputChange}
                      placeholder="Number of sisters and their details"
                      rows={2}
                    />
                    {errors.sistersDetails && (
                      <p className="text-red-500 text-sm">
                        {errors.sistersDetails}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">पत्ता / Address</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentAddress">
                      सध्याचा पत्ता (Current Address)
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="currentAddress"
                      name="currentAddress"
                      value={formData.currentAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your current address"
                      rows={3}
                    />
                    {errors.currentAddress && (
                      <p className="text-red-500 text-sm">
                        {errors.currentAddress}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="permanentAddress">
                      कायमचा पत्ता (Permanent Address)
                    </Label>
                    <Textarea
                      id="permanentAddress"
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your permanent address"
                      rows={3}
                    />
                    {errors.permanentAddress && (
                      <p className="text-red-500 text-sm">
                        {errors.permanentAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">
                  आर्थिक माहिती / Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">
                      वार्षिक उत्पन्न (Annual Income)
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="annualIncome"
                      name="annualIncome"
                      value={formData.annualIncome}
                      onChange={handleInputChange}
                      placeholder="Enter your annual income"
                    />
                    {errors.annualIncome && (
                      <p className="text-red-500 text-sm">
                        {errors.annualIncome}
                      </p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">रक्तगट (Blood Group)</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={(value) =>
                        handleSelectChange("bloodGroup", value)
                      }
                    >
                      <SelectTrigger id="bloodGroup">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.bloodGroup && (
                      <p className="text-red-500 text-sm">
                        {errors.bloodGroup}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Partner Expectations */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">
                  जीवनसाथी विषयी अपेक्षा / Partner Expectations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expectedQualification">
                      अपेक्षित शिक्षण (Expected Education)
                    </Label>
                    <Input
                      id="expectedQualification"
                      name="expectedQualification"
                      value={formData.expectedQualification}
                      onChange={handleInputChange}
                      placeholder="Enter expected education qualification"
                    />
                    {errors.expectedQualification && (
                      <p className="text-red-500 text-sm">
                        {errors.expectedQualification}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedIncome">
                      अपेक्षित उत्पन्न (Expected Income)
                    </Label>
                    <Input
                      id="expectedIncome"
                      name="expectedIncome"
                      value={formData.expectedIncome}
                      onChange={handleInputChange}
                      placeholder="Enter expected income"
                    />
                    {errors.expectedIncome && (
                      <p className="text-red-500 text-sm">
                        {errors.expectedIncome}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageRange">
                      अपेक्षित वयोगट (Expected Age Range)
                    </Label>
                    <Input
                      id="ageRange"
                      name="ageRange"
                      value={formData.ageRange}
                      onChange={handleInputChange}
                      placeholder="e.g., 25-30 years"
                    />
                    {errors.ageRange && (
                      <p className="text-red-500 text-sm">{errors.ageRange}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedHeight">
                      अपेक्षित उंची (Expected Height)
                    </Label>
                    <Input
                      id="expectedHeight"
                      name="expectedHeight"
                      value={formData.expectedHeight}
                      onChange={handleInputChange}
                      placeholder="e.g., Above 5 feet 4 inches"
                    />
                    {errors.expectedHeight && (
                      <p className="text-red-500 text-sm">
                        {errors.expectedHeight}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredCity">
                      पसंतीचे शहर (Preferred City)
                    </Label>
                    <Input
                      id="preferredCity"
                      name="preferredCity"
                      value={formData.preferredCity}
                      onChange={handleInputChange}
                      placeholder="Enter preferred city"
                    />
                    {errors.preferredCity && (
                      <p className="text-red-500 text-sm">
                        {errors.preferredCity}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="partnerExpectations">
                      जोडीदारा विषयी इतर अपेक्षा (Other Partner Expectations)
                    </Label>
                    <Textarea
                      id="partnerExpectations"
                      name="partnerExpectations"
                      value={formData.partnerExpectations}
                      onChange={handleInputChange}
                      placeholder="Describe your expectations from your partner"
                      rows={3}
                    />
                    {errors.partnerExpectations && (
                      <p className="text-red-500 text-sm">
                        {errors.partnerExpectations}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* About Self */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">
                  स्वतःविषयी / About Yourself
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="aboutSelf">
                      स्वतःविषयी थोडक्यात माहिती (Brief information about
                      yourself)
                    </Label>
                    <Textarea
                      id="aboutSelf"
                      name="aboutSelf"
                      value={formData.aboutSelf}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself, your interests, hobbies, lifestyle, etc."
                      rows={4}
                    />
                    {errors.aboutSelf && (
                      <p className="text-red-500 text-sm">{errors.aboutSelf}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attendee Count */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">
                  अंदाजित उपस्थिती / Expected Attendance
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="attendeeCount">
                      <Users className="inline-block w-4 h-4 mr-1" />
                      मेहमानों की संख्या (Guest Count)
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={decrementAttendeeCount}
                          disabled={formData.attendeeCount <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="font-medium text-center w-16">
                          {formData.attendeeCount}{" "}
                          {formData.attendeeCount === 1 ? "Person" : "Persons"}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={incrementAttendeeCount}
                          disabled={formData.attendeeCount >= 3}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="px-2">
                        <Slider
                          value={[formData.attendeeCount]}
                          min={1}
                          max={3}
                          step={1}
                          onValueChange={handleAttendeeCountChange}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">फोटो / Photo</h3>
                <div className="space-y-2">
                  <Label htmlFor="photo">
                    फोटो अपलोड करा (Upload Photo){" "}
                    <span className="text-sm text-gray-500">(Optional)</span>
                  </Label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div
                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload a photo (max 5MB)
                        </p>
                        <input
                          type="file"
                          id="photo"
                          name="photo"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>

                    {photoPreview && (
                      <div className="flex-shrink-0">
                        <Avatar className="h-20 w-20 border-2 border-slate-200">
                          <AvatarImage src={photoPreview} alt="Preview" />
                          <AvatarFallback>
                            <User className="h-10 w-10" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 border-t bg-slate-50 py-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-green-700">
                <h2 className="text-xl font-semibold">
                  Registration Successful!
                </h2>
                <p>Your profile has been registered successfully.</p>

                <p className="mt-2 text-sm">
                  A confirmation email has been sent. If you don&apos;t see it
                  in your inbox, please check your spam folder or search for{" "}
                  <span className="font-medium">
                    dataelegancesolution@gmail.com
                  </span>{" "}
                  in your email.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-medium">Your QR Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code at the event for quick check-in
                </p>
                <div className="bg-white p-6 rounded-lg inline-block">
                  <QRCodeSVG
                    value={qrData}
                    size={220}
                    level="M"
                    includeMargin={true}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    imageSettings={{
                      src: "/logo.png",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Please save or screenshot this QR code for the event.
              </p>

              <Button
                onClick={() => router.refresh}
                variant="outline"
                className="mt-4"
              >
                Register New (Pandharpur only)
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default PandharpurRegistrationForm;
