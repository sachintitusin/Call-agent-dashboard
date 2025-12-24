import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client
 *
 * Uses anon key because:
 * - Function runs server-side
 * - Access controlled by RLS or assessment setup
 */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Allowed frontend origins
 */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://call-agent-dashboard.vercel.app",
  "https://call-agent-dashboard-omgcw6a9f-sachinottawas-projects.vercel.app",
];

/**
 * Save Graph Data API
 *
 * Rules:
 * - One email → one user
 * - Graph data is a FULL snapshot
 * - Re-submitting overwrites previous snapshot
 * - Values must be between 0–100
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  /* ------------------------
   * CORS
   * ------------------------ */
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* ------------------------
   * Input validation
   * ------------------------ */
  const { email, data } = req.body as {
    email?: string;
    data?: Record<string, number>;
  };

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email is required" });
  }

  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "data is required" });
  }

  /* ------------------------
   * Validate values (0–100)
   * ------------------------ */
  for (const [hour, value] of Object.entries(data)) {
    if (typeof value !== "number" || value < 0 || value > 100) {
      return res.status(400).json({
        error: `Invalid conversion value for "${hour}". Must be between 0 and 100.`,
      });
    }
  }

  /* ------------------------
   * Get or create user
   * ------------------------ */
  let userId: string;

  const { data: existingUser, error: userFetchError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (userFetchError && userFetchError.code !== "PGRST116") {
    console.error(userFetchError);
    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({ email })
      .select("id")
      .single();

    if (createError || !newUser) {
      console.error(createError);
      return res.status(500).json({
        error: "Failed to create user",
      });
    }

    userId = newUser.id;
  }

  /* ------------------------
   * Overwrite existing graph data
   * ------------------------ */
  const { error: deleteError } = await supabase
    .from("graph_data")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    console.error(deleteError);
    return res.status(500).json({
      error: "Failed to overwrite existing graph data",
    });
  }

  /* ------------------------
   * Insert new snapshot
   * ------------------------ */
  const rows = Object.entries(data).map(([hour, value]) => ({
    user_id: userId,
    hour_label: hour,
    conversion_percentage: value,
  }));

  const { error: insertError } = await supabase
    .from("graph_data")
    .insert(rows);

  if (insertError) {
    console.error(insertError);
    return res.status(500).json({
      error: "Failed to save graph data",
    });
  }

  /* ------------------------
   * Success
   * ------------------------ */
  return res.status(200).json({ success: true });
}
