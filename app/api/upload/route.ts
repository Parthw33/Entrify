// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Return a Promise to ensure it resolves to `NextResponse`
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "profile_images",
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            return resolve(
              NextResponse.json(
                { error: "Failed to upload to Cloudinary" },
                { status: 500 }
              )
            );
          }

          resolve(
            NextResponse.json({
              url: result.secure_url,
              public_id: result.public_id,
            })
          );
        }
      );

      // Ensure the stream ends properly
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
