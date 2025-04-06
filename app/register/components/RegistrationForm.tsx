"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { z } from "zod";
import { registerProfile } from "@/app/actions/registerProfile";
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

const registrationSchema = z.object({
  anubandhId: z.string().min(1, "Anubandh ID is required"),
  name: z.string().min(1, "Name is required"),
  mobileNumber: z
    .string()
    .regex(
      /^[987]\d{9}$/,
      "Mobile number must be 10 digits and start with 9, 8, or 7"
    ),
  email: z.string().email("Invalid email format"),
  dateOfBirth: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  education: z.string().optional(),
  aboutSelf: z.string().optional(),
  address: z.string().optional(),
  firstGotra: z.string().optional(),
  secondGotra: z.string().optional(),
  annualIncome: z.string().optional(),
  expectedIncome: z.string().optional(),
  attendeeCount: z.number().min(1).optional(),
  photo: z.any().optional(),
  gender: z.string().optional(),
});

interface FormData {
  anubandhId: string;
  name: string;
  mobileNumber: string;
  dateOfBirth: string;
  email: string;
  birthTime: string;
  birthPlace: string;
  education: string;
  aboutSelf: string;
  address: string;
  firstGotra: string;
  secondGotra: string;
  annualIncome: string;
  expectedIncome: string;
  attendeeCount: number;
  gender: string;
  photo: File | null;
}

const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    anubandhId: "",
    name: "",
    mobileNumber: "",
    dateOfBirth: "",
    email: "",
    birthTime: "",
    birthPlace: "",
    education: "",
    aboutSelf: "",
    address: "",
    firstGotra: "",
    secondGotra: "",
    annualIncome: "",
    expectedIncome: "",
    attendeeCount: 1,
    gender: "",
    photo: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Direct Cloudinary upload using their upload API (no SDK needed)
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validationResult = registrationSchema.safeParse(formData);
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
      // Upload image to Cloudinary if photo exists
      let photoUrl = "";
      if (formData.photo) {
        photoUrl = await uploadToCloudinary(formData.photo);
      }

      // Use the server action to register the profile
      const result = await registerProfile({
        anubandhId: formData.anubandhId,
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        education: formData.education,
        aboutSelf: formData.aboutSelf,
        address: formData.address,
        photo: photoUrl,
        firstGotra: formData.firstGotra,
        secondGotra: formData.secondGotra,
        annualIncome: formData.annualIncome,
        expectedIncome: formData.expectedIncome,
        attendeeCount: formData.attendeeCount,
        gender: formData.gender,
      });

      // Create a simplified QR data format to ensure compatibility
      // Only include essential information in a compact format
      const qrDataObj = {
        id: formData.anubandhId,
        name: formData.name,
        mobile: formData.mobileNumber,
        attendees: formData.attendeeCount,
      };

      // Convert to JSON string with minimal whitespace
      const qrDataString = JSON.stringify(qrDataObj);

      setQrData(qrDataString);
      localStorage.setItem("registrationData", qrDataString);
      setSubmitted(true);

      // Send email with QR code
      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            qrData: qrDataString,
            name: formData.name,
            anuBandhId: formData.anubandhId,
            mobileNumber: formData.mobileNumber,
            address: formData.address,
            education: formData.education,
            attendeeCount: formData.attendeeCount.toString(),
          }),
        });

        const emailResult = await response.json();
        if (emailResult.success) {
          toast.success("Registration successful! QR code sent to your email!");
        } else {
          toast.warning("Registration successful but failed to send email.");
        }
      } catch (error) {
        console.error("Email error:", error);
        toast.warning("Registration successful but failed to send email.");
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
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                नोंदणी फॉर्म / Registration Form
              </CardTitle>
              <CardDescription>
                Fill in your details to register for the event
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Registration
            </Badge>
          </div>
        </CardHeader>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-6">
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
                  <Label htmlFor="anubandhId">
                    अनुबंध आयडी (Anubandh ID)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="anubandhId"
                    name="anubandhId"
                    value={formData.anubandhId}
                    onChange={handleInputChange}
                    placeholder="Enter Anubandh ID"
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
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">
                    मोबाईल नंबर (Mobile NO)
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
                    ईमेल (Email)<span className="text-red-500">*</span>
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
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
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
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <Label htmlFor="education">
                    <Book className="inline-block w-4 h-4 mr-1" />
                    शिक्षण (Education)
                  </Label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Enter your education details"
                  />
                </div>

                {/* First Gotra */}
                <div className="space-y-2">
                  <Label htmlFor="firstGotra">पहिले गोत्र (First gotra)</Label>
                  <Input
                    id="firstGotra"
                    name="firstGotra"
                    value={formData.firstGotra}
                    onChange={handleInputChange}
                    placeholder="Enter your first gotra"
                  />
                </div>

                {/* Second Gotra */}
                <div className="space-y-2">
                  <Label htmlFor="secondGotra">
                    दुसरे गोत्र (Second gotra)
                  </Label>
                  <Input
                    id="secondGotra"
                    name="secondGotra"
                    value={formData.secondGotra}
                    onChange={handleInputChange}
                    placeholder="Enter your second gotra"
                  />
                </div>

                {/* Annual Income */}
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">
                    (वार्षिक उत्पन्न) Annual Income
                  </Label>
                  <Input
                    id="annualIncome"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleInputChange}
                    placeholder="Enter your annual income"
                  />
                </div>

                {/* Expected Income */}
                <div className="space-y-2">
                  <Label htmlFor="expectedIncome">
                    वार्षिक उत्पन्न अपेक्षा (Expected Income)
                  </Label>
                  <Input
                    id="expectedIncome"
                    name="expectedIncome"
                    value={formData.expectedIncome}
                    onChange={handleInputChange}
                    placeholder="Enter expected income"
                  />
                </div>

                {/* Attendee Count */}
                <div className="space-y-2">
                  <Label htmlFor="attendeeCount">
                    <Users className="inline-block w-4 h-4 mr-1" />
                    मेहमानों की संख्या (Guest Count.)
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
                        disabled={formData.attendeeCount >= 10}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="px-2">
                      <Slider
                        value={[formData.attendeeCount]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={handleAttendeeCountChange}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">
                    <Home className="inline-block w-4 h-4 mr-1" />
                    पत्ता (Address)
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    rows={2}
                  />
                </div>

                {/* About Self */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="aboutSelf">
                    स्वतः विषयी थोडक्यात माहिती (Brief information about
                    yourself)
                  </Label>
                  <Textarea
                    id="aboutSelf"
                    name="aboutSelf"
                    value={formData.aboutSelf}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="photo">फोटो (Photo)</Label>
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
                A copy of this QR code has been sent to your email address.
              </p>

              <Button
                onClick={() => router.push("/qr-code")}
                variant="outline"
                className="mt-4"
              >
                View Registration Details
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default RegistrationForm;
