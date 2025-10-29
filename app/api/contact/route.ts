import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { name, email, company, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Log the submission
    console.log("Contact Form Submission:", {
      name,
      email,
      company,
      message,
      userId: userId || "Anonymous",
      timestamp: new Date().toISOString(),
    });

    // Send email using Resend API
    try {
      const data = await resend.emails.send({
        from: "EcoPack AI <onboarding@resend.dev>", // Using Resend's test domain
        to: ["ecopackai@gmail.com"], // Your Resend verified email
        replyTo: email, // User's email for easy reply
        subject: `New Contact Form: ${name}${
          company ? ` from ${company}` : ""
        }`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🌱 New Contact Form Submission</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #059669; margin-top: 0; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Contact Details</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563; width: 120px;">👤 Name:</td>
          <td style="padding: 10px 0; color: #1f2937;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">📧 Email:</td>
          <td style="padding: 10px 0; color: #1f2937;"><a href="mailto:${email}" style="color: #059669; text-decoration: none;">${email}</a></td>
        </tr>
        ${
          company
            ? `<tr>
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">🏢 Company:</td>
          <td style="padding: 10px 0; color: #1f2937;">${company}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">🆔 User ID:</td>
          <td style="padding: 10px 0; color: #1f2937;">${
            userId || "Anonymous (Not logged in)"
          }</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">📅 Date:</td>
          <td style="padding: 10px 0; color: #1f2937;">${new Date().toLocaleString(
            "en-US",
            {
              dateStyle: "full",
              timeStyle: "short",
            }
          )}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #059669; margin-top: 0; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">💬 Message</h2>
      <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; white-space: pre-wrap; word-wrap: break-word;">
        ${message}
      </div>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
      <p style="margin: 5px 0;">
        <strong>Quick Actions:</strong>
      </p>
      <a href="mailto:${email}?subject=Re: Your inquiry to EcoPack AI" 
         style="display: inline-block; margin: 10px 5px; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        📧 Reply to ${name}
      </a>
    </div>
    
    <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p>This email was sent from the EcoPack AI contact form</p>
      <p style="margin: 5px 0;">🌍 <strong>EcoPack AI</strong> - Sustainable Packaging Recommendations</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `
New Contact Form Submission - EcoPack AI

Contact Details:
-------------------
Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ""}
User ID: ${userId || "Anonymous (Not logged in)"}
Date: ${new Date().toISOString()}

Message:
-------------------
${message}

-------------------
Reply to this email or contact ${email} directly.
        `,
      });

      console.log("Email sent successfully:", data);

      return NextResponse.json({
        success: true,
        message:
          "Your message has been sent successfully! We'll get back to you soon.",
        emailId: data.id,
      });
    } catch (emailError: any) {
      console.error("Resend API error:", emailError);

      // If email fails, still log the message but inform user
      return NextResponse.json({
        success: false,
        error:
          "Failed to send email. Please try emailing us directly at ecopackai@gmail.com",
        details: emailError.message,
      });
    }
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to process your message. Please try again or email us at ecopackai@gmail.com",
      },
      { status: 500 }
    );
  }
}
