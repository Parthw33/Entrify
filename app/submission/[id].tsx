// pages/submission/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

interface FormData {
  anubandh_id: string;
  name: string;
  mobile: string;
  dob: string;
  birth_time: string;
  birth_place: string;
  education: string;
  about: string;
  photo: string | null;
}

const SubmissionPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only run once the router is ready and we have an ID
    if (!router.isReady || !id) return;

    try {
      const storedData = localStorage.getItem(`registration_${id}`);

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      } else {
        setError(`No data found for submission ID: ${id}`);
      }
    } catch (error) {
      console.error("Error fetching submission data:", error);
      setError("Failed to load submission data");
    } finally {
      setLoading(false);
    }
  }, [router.isReady, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error || "No data found"}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Registration Form
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Submission Details
      </h1>
      <p className="text-center mb-4 text-sm text-gray-500">ID: {id}</p>

      <div className="space-y-4">
        {formData.photo && (
          <div className="flex justify-center mb-6">
            <Image
              src={formData.photo}
              alt="User Photo"
              width={32}
              height={32}
              className="object-cover rounded-full border-4 border-gray-200"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">अनुबंध आयडी (Anubandh ID)</p>
            <p>{formData.anubandh_id}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">वधू - वराचे नाव (Name)</p>
            <p>{formData.name}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">मोबाईल नंबर (Mobile NO)</p>
            <p>{formData.mobile}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">जन्म तारीख (Date Of Birth)</p>
            <p>{formData.dob || "Not provided"}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">जन्म वेळ (Birth Time)</p>
            <p>{formData.birth_time || "Not provided"}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">जन्म ठिकाण (Birth Place)</p>
            <p>{formData.birth_place || "Not provided"}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">शिक्षण (Education)</p>
            <p>{formData.education || "Not provided"}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <p className="font-semibold">
            स्वतः विषयी थोडक्यात माहिती (Brief information)
          </p>
          <p>{formData.about || "Not provided"}</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Registration Form
        </button>
      </div>
    </div>
  );
};

export default SubmissionPage;
