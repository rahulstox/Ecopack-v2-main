import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // Keep auth from here
import { clerkClient } from "@clerk/clerk-sdk-node"; // <-- Change this line
import { upsertUserProfile, getUserProfile, UserProfileData } from "@/lib/db";

export const dynamic = "force-dynamic"; // Ensure fresh execution on every request

export async function GET(request: NextRequest) {
  console.log("--- /api/profile GET request received ---");
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await getUserProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    console.error("❌ API /api/profile GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("--- /api/profile POST request received ---");
  try {
    // 1️⃣ Get Authenticated User (Await the auth() call)
    const { userId } = await auth(); // <-- Added await here
    console.log("User ID from auth():", userId);

    if (!userId) {
      console.error(
        "API /api/profile Error: Unauthorized - No userId found in session."
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2️⃣ Parse and Validate Request Body
    const body = await request.json();
    if (!body || typeof body !== "object" || body.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Invalid data or mismatched user ID" },
        { status: 400 }
      );
    }

    // 3️⃣ Construct Profile Data
    const profileData: UserProfileData = {
      userId, // Use the userId obtained from auth()
      primaryVehicleType: body.primaryVehicleType,
      fuelType: body.fuelType,
      householdSize: body.householdSize,
      dietType: body.dietType,
      homeEnergySource: body.homeEnergySource,
      commuteDistance: body.commuteDistance,
      commuteMode: body.commuteMode,
      // Add any other fields as per your schema
    };

    // 4️⃣ Save to Database
    console.log("Attempting to save profile data to DB for user:", userId);
    const savedProfile = await upsertUserProfile(profileData);
    if (!savedProfile) {
      throw new Error("Failed to save user profile to the database.");
    }
    console.log("Profile data saved successfully to DB.");

    // 5️⃣ Update Clerk Public Metadata (clerkClient is used directly)
    console.log("Attempting to update Clerk metadata for user:", userId);
    try {
      // Use clerkClient directly, it's not a function call
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          onboardingComplete: true,
        },
      });
      console.log(`✅ Clerk metadata updated successfully for user ${userId}`);
    } catch (clerkError) {
      console.error(
        `⚠️ Clerk metadata update failed for ${userId}:`,
        clerkError
      );
      // Not critical — user profile still saved in DB
    }

    // 6️⃣ Return Success Response
    return NextResponse.json({ success: true, data: savedProfile });
  } catch (error: any) {
    console.error("❌ API /api/profile Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
