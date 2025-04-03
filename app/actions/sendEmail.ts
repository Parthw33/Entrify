import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

interface EmailData {
  email: string;
  qrData: string;
  name: string;
  anuBandhId: string;
  mobileNumber: string;
  address: string;
  education: string;
  attendeeCount:string;
}

export async function sendEmail(data: EmailData) {
  try {
    const { email, qrData, name, anuBandhId, mobileNumber, address, education } = data;

    if (!email || !qrData || !name) {
      throw new Error("Missing required fields");
    }

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Registration Confirmation & QR Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          
          <!-- Header Image -->
          <div style="text-align: center; background-color: #f8f9fa; padding: 10px;">
            <img src="https://res.cloudinary.com/ddrxbg3h9/image/upload/v1741503397/Sneh_melava_brpsgc.png" alt="Sneh Melava" style="width: 100%; max-height: 200px; object-fit: cover;"/>
          </div>

          <!-- Welcome Message -->
          <div style="padding: 20px;">
            <h2 style="color: #333;">Dear ${name},</h2>
            <p>Thank you for registering! Below are your registration details:</p>
          </div>

          <!-- User Details Table -->
          <table style="width: 100%; border-collapse: collapse; background: #fff; font-size: 14px;">
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Anubandh ID:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${anuBandhId}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Email:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${email}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Mobile Number:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${mobileNumber || "—"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Address:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${address || "—"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Education:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${education || "—"}</td></tr>
          </table>

          <!-- QR Code -->
          <div style="text-align: center; margin: 20px 0;">
            <p style="font-weight: bold;">Scan this QR code to access your registration details:</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}" alt="QR Code" style="border-radius: 10px;"/>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #777; padding: 10px; background: #f8f9fa; border-top: 1px solid #ddd;">
            <p>Designed & Developed By <strong>DataElegance Solutions</strong></p>
            <p>Rajendra Wattamwar & Sulbha Wattamwar</p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return { success: true, message: "Email sent successfully!" };
  } catch (error: unknown) {
    console.error("Email sending error:", error);
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to send email");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
} 