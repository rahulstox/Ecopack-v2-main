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
        userid VARCHAR(255) NOT NULL,
        form_input JSONB NOT NULL,
        ai_output JSONB NOT NULL,
        carbon_score NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Checked/created "recommendations" table.');

    // Add userid column if it doesn't exist (for existing tables)
    try {
      await sql`ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS userid VARCHAR(255) DEFAULT 'anonymous'`;
      // Set default values for existing rows
      await sql`UPDATE recommendations SET userid = 'anonymous' WHERE userid IS NULL OR userid = ''`;
      console.log("Added userid column to recommendations table.");
    } catch (alterError: any) {
      // Column might already exist
      if (!alterError.message.includes("already exists")) {
        console.log("Note: Could not add userid column:", alterError.message);
      }
    }

    // Add index on userid for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_recommendations_userid ON recommendations(userid);
    `;
    console.log("Checked/created index on recommendations.userid.");

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

    // Ensure username column exists and is unique
    try {
      await sql`ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "username" VARCHAR(100)`;
    } catch (e) {
      // ignore
    }
    try {
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_userprofile_username_unique ON "UserProfile"(lower("username")) WHERE "username" IS NOT NULL`;
    } catch (e) {
      // ignore
    }

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

    // Table for quiz results
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        userid VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        percentage NUMERIC NOT NULL,
        reward_eligible BOOLEAN DEFAULT FALSE,
        completedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Checked/created "quiz_results" table.');

    // Add reward_eligible column if it doesn't exist (for existing tables)
    try {
      await sql`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS reward_eligible BOOLEAN DEFAULT FALSE`;
      console.log("Added reward_eligible column to quiz_results table.");
    } catch (alterError: any) {
      if (!alterError.message.includes("already exists")) {
        console.log(
          "Note: Could not add reward_eligible column:",
          alterError.message
        );
      }
    }

    // Table for site statistics
    await sql`
      CREATE TABLE IF NOT EXISTS site_stats (
        id INTEGER PRIMARY KEY,
        visit_count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Checked/created "site_stats" table.');

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
  userid: string;
  form_input: any;
  ai_output: any;
  carbon_score: number;
}) {
  await ensureInitialized(); // Ensure tables exist
  return await sql`
    INSERT INTO recommendations (userid, form_input, ai_output, carbon_score)
    VALUES (${data.userid}, ${JSON.stringify(
    data.form_input
  )}, ${JSON.stringify(data.ai_output)}, ${data.carbon_score})
    RETURNING id;
  `;
}

export async function getUserRecommendations(userId: string) {
  await ensureInitialized();
  const result = await sql`
    SELECT * FROM recommendations 
    WHERE userid = ${userId}
    ORDER BY created_at DESC
  `;
  return result as any[];
}

export async function getRecommendationById(id: number) {
  await ensureInitialized();
  const result = await sql`
    SELECT * FROM recommendations WHERE id = ${id}
  `;
  return result[0] as any;
}

export async function getAllRecommendations() {
  await ensureInitialized(); // Ensure tables exist
  return await sql`
    SELECT * FROM recommendations
    ORDER BY created_at DESC;
  `;
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
  // Note: PostgreSQL column names are lowercase
  const result = await sql`
        INSERT INTO ActionLog (userid, category, activity, amount, unit, calculatedco2e, rawinput, loggedat)
        VALUES (${userId}, ${category}, ${activity}, ${amount}, ${unit}, ${calculatedCo2e}, ${
    rawInput ?? null
  }, CURRENT_TIMESTAMP)
        RETURNING id, loggedat as "loggedAt";
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
        SELECT id, userid as "userId", category, activity, amount, unit, 
               calculatedco2e as "calculatedCo2e", rawinput as "rawInput", 
               COALESCE(loggedat, CURRENT_TIMESTAMP) as "loggedAt" 
        FROM ActionLog
        WHERE userid = ${userId}
        ORDER BY COALESCE(loggedat, CURRENT_TIMESTAMP) DESC
        LIMIT ${limit} OFFSET ${offset};
    `;

  console.log("📊 Fetched action logs:", result.length, "entries");
  if (result.length > 0) {
    console.log("📅 Sample loggedAt:", result[0].loggedAt);
    console.log("📅 loggedAt type:", typeof result[0].loggedAt);
    console.log("📊 Sample calculatedCo2e:", result[0].calculatedCo2e);
  }

  return result as ActionLogData[]; // Type assertion
}

// Export the sql instance if needed elsewhere, though functions are preferred
export { sql };
