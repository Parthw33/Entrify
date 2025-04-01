// components/RegistrationForm.tsx
"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { z } from "zod";

const registrationSchema = z.object({
  anubandh_id: z.string().min(1, "Anubandh ID is required"),
  name: z.string().min(1, "Name is required"),
  mobile: z
    .string()
    .regex(
      /^[987]\d{9}$/,
      "Mobile number must be 10 digits and start with 9, 8, or 7"
    ),
  email: z.string().email("Invalid email format"),
  dob: z.string().optional(),
  birth_time: z.string().optional(),
  birth_place: z.string().optional(),
  education: z.string().optional(),
  about: z.string().optional(),
  address: z.string().optional(),
  photo: z.any().optional(),
});

interface FormData {
  anubandh_id: string;
  name: string;
  mobile: string;
  dob: string;
  email: string;
  birth_time: string;
  birth_place: string;
  education: string;
  about: string;
  address: string;
  photo: File | null;
}

const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    anubandh_id: "",
    name: "",
    mobile: "",
    dob: "",
    email: "",
    birth_time: "",
    birth_place: "",
    education: "",
    about: "",
    address: "",
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
      return;
    }

    try {
      // Upload image to Cloudinary if photo exists
      let photoUrl = "";
      if (formData.photo) {
        photoUrl = await uploadToCloudinary(formData.photo);
      }

      // Prepare data for MongoDB
      const dataForDB = {
        contractId: formData.anubandh_id,
        name: formData.name,
        mobileNumber: formData.mobile,
        email: formData.email,
        dateOfBirth: formData.dob ? new Date(formData.dob).toISOString() : null,
        birthTime: formData.birth_time,
        birthPlace: formData.birth_place,
        education: formData.education,
        aboutYourself: formData.about,
        address: formData.address,
        photo: photoUrl,
      };

      // Save to MongoDB using Prisma API route
      const saveResponse = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForDB),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save data to database");
      }

      const savedData = await saveResponse.json();

      // Create QR data (exclude photo file)
      const { photo, ...dataForQR } = formData;
      const qrDataObj = {
        ...dataForQR,
        photoUrl: photoUrl,
        profileId: savedData.id,
      };
      const qrDataString = JSON.stringify(qrDataObj);

      setQrData(qrDataString);
      localStorage.setItem("registrationData", qrDataString);
      setSubmitted(true);

      // Send email with QR code
      try {
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            qrData: qrDataString,
            name: formData.name,
            anuBandhId: formData.anubandh_id,
            mobileNumber: formData.mobile,
            address: formData.address,
            education: formData.education,
          }),
        });

        const result = await emailResponse.json();
        if (result.success) {
          alert("Registration successful! QR code sent to your email!");
        } else {
          alert("Registration successful but failed to send email.");
        }
      } catch (error) {
        console.error("Email error:", error);
        alert("Registration successful but failed to send email.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        नोंदणी फॉर्म / Registration Form
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anubandh ID */}
        <div>
          <label>अनुबंध आयडी (Anubandh ID)*</label>
          <input
            type="text"
            name="anubandh_id"
            value={formData.anubandh_id}
            onChange={handleInputChange}
            placeholder="Enter Anubandh ID"
            className="w-full p-2 border rounded"
          />
          {errors.anubandh_id && (
            <p className="text-red-500">{errors.anubandh_id}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label>वधू - वराचे नाव (Name)*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your Full name"
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-500">{errors.name}</p>}
        </div>

        {/* Mobile Number Validation */}
        <div>
          <label>मोबाईल नंबर (Mobile NO)*</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
              if (value.length <= 10) {
                setFormData((prev) => ({ ...prev, mobile: value }));
              }
            }}
            maxLength={10}
            placeholder="Enter your Mobile Number"
            className="w-full p-2 border rounded"
          />
          {errors.mobile && <p className="text-red-500">{errors.mobile}</p>}
        </div>

        {/* Email Validation */}
        <div>
          <label>ईमेल (Email)*</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your Email Address"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="dob">
            जन्म तारीख (Date Of Birth)
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="birth_time">
            जन्म वेळ (Birth Time)
          </label>
          <input
            type="time"
            id="birth_time"
            name="birth_time"
            value={formData.birth_time}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="birth_place">
            जन्म ठिकाण (Birth Place)
          </label>
          <input
            type="text"
            id="birth_place"
            name="birth_place"
            value={formData.birth_place}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="address">
            पत्ता (Address)
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="education">
            शिक्षण (Education)
          </label>
          <input
            type="text"
            id="education"
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="about">
            स्वतः विषयी थोडक्यात माहिती (Brief information about yourself)
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded h-24"
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="photo">
            फोटो (Photo)
          </label>
          <input
            type="file"
            id="photo"
            name="photo"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
            accept="image/*"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload 1 supported file. Max 10 MB.
          </p>

          {photoPreview && (
            <div className="mt-2">
              <Image
                src={photoPreview}
                alt="Preview"
                width={100}
                height={100}
                className="object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {submitted && qrData && (
        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold mb-4">Your QR Code</h2>
          <div className="flex justify-center">
            <QRCodeSVG value={qrData} size={300} level="L" />
          </div>
          <p className="mt-4 text-sm">
            Scan this QR code to view your registration details or visit{" "}
            <button
              className="text-blue-500 underline"
              onClick={() => router.push("/qr-code")}
            >
              registration details page
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
