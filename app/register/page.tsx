"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react"; // Use named import instead of default import
import Image from "next/image";

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
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [qrData, setQrData] = useState("");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { photo, ...dataForQR } = formData;
    const qrDataString = JSON.stringify(dataForQR);

    setQrData(qrDataString);
    localStorage.setItem("registrationData", qrDataString);

    setSubmitted(true);

    // Send email
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, qrData: qrDataString }),
      });

      const result = await response.json();
      if (result.success) {
        alert("QR code sent to your email!");
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Email error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        नोंदणी फॉर्म / Registration Form
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="block mb-1" htmlFor="anubandh_id">
            अनुबंध आयडी (Anubandh ID)*
          </label>
          <input
            type="text"
            id="anubandh_id"
            name="anubandh_id"
            value={formData.anubandh_id}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="name">
            वधू - वराचे नाव (Name)*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="mobile">
            मोबाईल नंबर (Mobile NO)*
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="form-group">
          <label className="block mb-1" htmlFor="email">
            ईमेल (Email)*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
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
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit
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
