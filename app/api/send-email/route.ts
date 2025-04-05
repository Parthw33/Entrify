import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, qrData, name, anuBandhId, mobileNumber, address, education ,attendeeCount} = await req.json();

    if (!email || !qrData || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
            <h2 style="color: #333;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">पंढरपूर येथील <strong>"स्नेह बंध मेळावा 2025"</strong> कार्यक्रमात आपली यशस्वीरित्या नोंदणी झाली आहे.</p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">माहिती :</p>
          </div>

          <!-- User Details Table -->
          <table style="width: 100%; border-collapse: collapse; background: #fff; font-size: 14px;">
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Anubandh ID:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${anuBandhId}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Email:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${email}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Mobile Number:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${mobileNumber || "—"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Address:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${address || "—"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Education:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${education || "—"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Guest Count:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${attendeeCount || "—"}</td></tr>
          </table>

          <div style="padding: 20px;">
            <h2 style="color: #333;">मेळावा स्थान:- </h2>
            <p style="margin-bottom: 10px;">श्री. मनमाडकर (भक्तिधाम) LIC ऑफिस समोर, पंढरपूर</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://maps.app.goo.gl/c7hYiGzkfDVZDWrT9?g_st=aw" style="display: inline-block; background-color: #4285F4; color: white; padding: 10px 15px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                <span style="vertical-align: middle; display: inline-flex; align-items: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" style="margin-right: 8px;">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Google Maps वर स्थान पहा
                </span>
              </a>
            </div>
            <p style="margin-top: 15px; font-style: italic; color: #666;">दिनांक: 13 April 2024 | वेळ: सकाळी 9:00 ते संध्याकाळी 6:00</p>
          </div>

          <!-- QR Code -->
          <div style="text-align: center; margin: 20px 0; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3 style="color: #333; margin-bottom: 15px;">आपला प्रवेश QR कोड</h3>
            <p style="font-weight: bold; margin-bottom: 15px;">कृपया हा QR कोड मेळाव्यात प्रवेश करताना स्कॅन करण्यासाठी सादर करावा:</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}" alt="QR Code" style="border-radius: 10px; border: 5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"/>
            <p style="margin-top: 15px; color: #666;">मेळाव्यात येण्यापूर्वी हा ईमेल सेव्ह करा किंवा QR कोड स्क्रीनशॉट घ्या.</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #777; padding: 10px; background: #f8f9fa; border-top: 1px solid #ddd;">
            <p>Designed & Developed By <strong>DataElegance Solutions LLP</strong></p>
            <p>Rajendra Wattamwar & Sulbha Wattamwar</p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error: unknown) {
    console.error("Email sending error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
    } else {
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
}
