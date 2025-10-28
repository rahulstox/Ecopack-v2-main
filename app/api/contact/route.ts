import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { name, email, company, message } = body;

    // Here you would integrate with an email service like SendGrid, Nodemailer, etc.
    // For now, we'll log the message and return success
    console.log("Contact Form Submission:", {
      name,
      email,
      company,
      message,
      userId: userId || "Anonymous",
      timestamp: new Date().toISOString(),
    });

    // In production, you would:
    // 1. Use a service like SendGrid, Resend, or Nodemailer
    // 2. Send email to ecopackai@gmail.com
    // 3. Format the message with user details

    // Example with console (replace with actual email service):
    const emailContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Company: ${company || "Not provided"}
User ID: ${userId || "Anonymous"}
Timestamp: ${new Date().toISOString()}

Message:
${message}
    `;

    console.log("Email content (would be sent to ecopackai@gmail.com):");
    console.log(emailContent);

    return NextResponse.json({
      success: true,
      message: "Your message has been received! We'll get back to you soon.",
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
