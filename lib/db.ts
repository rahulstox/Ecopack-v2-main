import { neon, neonConfig } from "@neondatabase/serverless";

// Ensure Neon uses WebSocket connections if available (improves performance)
// neonConfig.webSocketConstructor = WebSocket;

const sql = neon(process.env.DATABASE_URL!);

// No helper needed - Neon client handles this directly

async function initializeDatabaseTables() {
  try {
    // Table for original recommendations tool
    await sql`
      CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        form_input JSONB NOT NULL,
        ai_output JSONB NOT NULL,
        carbon_score NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Checked/created "recommendations" table.');

    // Table for user profile/onboarding data
    await sql`
      CREATE TABLE IF NOT EXISTS "UserProfile" (
        "userId" VARCHAR(255) PRIMARY KEY,
        "primaryVehicleType" VARCHAR(100),
        "fuelType" VARCHAR(50),
        "householdSize" INTEGER,
        "dietType" VARCHAR(100),
        "homeEnergySource" VARCHAR(100),
        "commuteDistance" NUMERIC,
        "commuteMode" VARCHAR(100),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Checked/created "UserProfile" table.');

    // Table for logging user actions (carbon footprint)
    await sql`
      CREATE TABLE IF NOT EXISTS ActionLog (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,    -- Clerk User ID (No foreign key yet)
        category VARCHAR(100) NOT NULL, -- e.g., 'TRANSPORT', 'FOOD', 'ENERGY'
        activity VARCHAR(100) NOT NULL, -- e.g., 'CAR_DRIVE', 'CHICKEN_MEAL'
        amount NUMERIC NOT NULL,
        unit VARCHAR(50) NOT NULL,      -- e.g., 'KM', 'G', 'KWH'
        calculatedCo2e NUMERIC NOT NULL, -- The calculated CO2 equivalent value
        rawInput TEXT,                   -- Optional: Store raw text if logged via AI
        loggedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Checked/created "ActionLog" table.');

    console.log("Database tables initialization check complete.");
  } catch (error) {
    console.error("Database initialization error:", error);
    // Throw the error if you want startup to fail on DB issues
    // throw error;
  }
}

// Track initialization promise to avoid multiple concurrent inits
let initPromise: Promise<void> | null = null;
let isInitialized = false;

async function ensureInitialized() {
  // If already initialized, return immediately
  if (isInitialized) return;

  // If init is in progress, wait for it
  if (initPromise) {
    await initPromise;
    return;
  }

  // Start initialization and track it
  initPromise = initializeDatabaseTables()
    .then(() => {
      isInitialized = true;
      console.log("Database initialization completed successfully");
    })
    .catch((err) => {
      console.error("Database initialization failed:", err);
      isInitialized = false;
      throw err;
    });

  // Wait for initialization to complete
  await initPromise;
}

// --- Functions for Recommendations Tool ---

export async function insertRecommendation(data: {
  form_input: any;
  ai_output: any;
  carbon_score: number;
}) {
  await ensureInitialized(); // Ensure tables exist
  return await sql`
    INSERT INTO recommendations (form_input, ai_output, carbon_score)
    VALUES (${JSON.stringify(data.form_input)}, ${JSON.stringify(
    data.ai_output
  )}, ${data.carbon_score})
    RETURNING id;
  `;
}

export async function getAllRecommendations() {
  await ensureInitialized(); // Ensure tables exist
  return await sql`
    SELECT * FROM recommendations
    ORDER BY created_at DESC;
  `;
}

export async function getRecommendationById(id: number) {
  await ensureInitialized(); // Ensure tables exist
  const result = await sql`
    SELECT * FROM recommendations WHERE id = ${id};
  `;
  return result[0];
}

// --- Functions for User Profile ---

// Type definition for UserProfile data (adjust fields as needed)
export interface UserProfileData {
  userId: string;
  primaryVehicleType?: string;
  fuelType?: string;
  householdSize?: number;
  dietType?: string;
  homeEnergySource?: string;
  commuteDistance?: number;
  commuteMode?: string;
}

export async function upsertUserProfile(data: UserProfileData) {
  // Ensure tables exist before proceeding
  await ensureInitialized();

  const { userId, ...profileData } = data;

  // Filter out null/undefined/empty values
  const validProfileData = Object.entries(profileData)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
    .reduce((obj, [key, value]) => {
      obj[key as keyof Omit<UserProfileData, "userId">] = value as any;
      return obj;
    }, {} as Partial<Omit<UserProfileData, "userId">>);

  const columns = Object.keys(validProfileData) as Array<
    keyof typeof validProfileData
  >;
  const values = Object.values(validProfileData);

  // --- Handle case where there's no data to update (only userId provided) ---
  if (columns.length === 0) {
    console.log(
      "No valid profile data provided to update/insert for user:",
      userId
    );
    try {
      const existing =
        await sql`SELECT * FROM "UserProfile" WHERE "userId" = ${userId}`;
      if (existing.length > 0) {
        console.log(`User ${userId} already exists, no update needed.`);
        return existing[0] as UserProfileData;
      } else {
        console.log(`User ${userId} does not exist, inserting minimal record.`);
        const insertResult = (await sql`
                    INSERT INTO "UserProfile" ("userId", "createdAt", "updatedAt")
                    VALUES (${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT ("userId") DO NOTHING
                    RETURNING *;
                `) as any[];
        // If insertResult is empty due to conflict/nothing, fetch again just in case
        if (insertResult.length === 0) {
          const finalCheck =
            await sql`SELECT * FROM "UserProfile" WHERE "userId" = ${userId}`;
          return finalCheck[0] as UserProfileData | undefined; // Return undefined if somehow still not found
        }
        return insertResult[0] as UserProfileData;
      }
    } catch (e) {
      console.error("Error checking/inserting minimal UserProfile:", e);
      throw e;
    }
  }

  // --- Execute the UPSERT using simpler approach without dynamic SQL ---
  try {
    console.log(
      `Upserting profile for ${userId} with columns: ${columns.join(", ")}`
    );

    // Since dynamic SQL is complex with Neon, use a simpler upsert approach:
    // First check if exists, then update or insert

    const existing =
      (await sql`SELECT * FROM "UserProfile" WHERE "userId" = ${userId}`) as any[];

    // Use direct SQL template with hardcoded columns
    // Since we know the columns, we can write them explicitly
    const result = (await sql`
      INSERT INTO "UserProfile" 
        ("userId", "primaryVehicleType", "fuelType", "householdSize", "dietType", "homeEnergySource", "commuteDistance", "commuteMode", "createdAt", "updatedAt")
      VALUES (
        ${userId}, 
        ${validProfileData.primaryVehicleType ?? null},
        ${validProfileData.fuelType ?? null},
        ${validProfileData.householdSize ?? null},
        ${validProfileData.dietType ?? null},
        ${validProfileData.homeEnergySource ?? null},
        ${validProfileData.commuteDistance ?? null},
        ${validProfileData.commuteMode ?? null},
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
      ON CONFLICT ("userId") DO UPDATE SET
        "primaryVehicleType" = EXCLUDED."primaryVehicleType",
        "fuelType" = EXCLUDED."fuelType",
        "householdSize" = EXCLUDED."householdSize",
        "dietType" = EXCLUDED."dietType",
        "homeEnergySource" = EXCLUDED."homeEnergySource",
        "commuteDistance" = EXCLUDED."commuteDistance",
        "commuteMode" = EXCLUDED."commuteMode",
        "updatedAt" = CURRENT_TIMESTAMP
      RETURNING *
    `) as any[];

    console.log(`Upsert successful for ${userId}`);
    return result[0] as UserProfileData;
  } catch (error) {
    console.error("Error during upsertUserProfile SQL execution:", error);
    console.error("Columns:", columns);
    console.error("Values:", values);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  await ensureInitialized(); // Ensure tables exist
  const result = await sql`
    SELECT * FROM UserProfile WHERE userId = ${userId};
  `;
  return result[0] as UserProfileData | undefined; // Type assertion
}

// --- Functions for Action Log ---

export interface ActionLogData {
  id?: number;
  userId: string;
  category: string;
  activity: string;
  amount: number;
  unit: string;
  calculatedCo2e: number;
  rawInput?: string; // Optional field for AI logging
  loggedAt?: string; // Optional, auto-generated by DB
}

export async function insertActionLog(data: ActionLogData) {
  await ensureInitialized(); // Ensure tables exist
  const { userId, category, activity, amount, unit, calculatedCo2e, rawInput } =
    data;

  // Insert with explicit loggedAt timestamp to ensure it's always set
  const result = await sql`
        INSERT INTO ActionLog (userId, category, activity, amount, unit, calculatedCo2e, rawInput, loggedAt)
        VALUES (${userId}, ${category}, ${activity}, ${amount}, ${unit}, ${calculatedCo2e}, ${
    rawInput ?? null
  }, CURRENT_TIMESTAMP)
        RETURNING id, loggedAt;
    `;
  console.log("💾 Inserted log with timestamp:", result[0].loggedAt);
  return result[0];
}

export async function getActionLogsByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  await ensureInitialized(); // Ensure tables exist
  const result = await sql`
        SELECT id, userId, category, activity, amount, unit, calculatedCo2e, rawInput, loggedAt 
        FROM ActionLog
        WHERE userId = ${userId}
        ORDER BY loggedAt DESC
        LIMIT ${limit} OFFSET ${offset};
    `;

  console.log("📊 Fetched action logs:", result.length, "entries");
  if (result.length > 0) {
    console.log("📅 Sample loggedAt:", result[0].loggedAt);
  }

  return result as ActionLogData[]; // Type assertion
}

// Export the sql instance if needed elsewhere, though functions are preferred
export { sql };
