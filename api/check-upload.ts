import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client
 *
 * Used only for a lightweight read operation.
 * This endpoint does NOT mutate data.
 */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Allowed frontend origins
 *
 * Only trusted dashboard deployments can query upload status.
 */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://call-agent-dashboard.vercel.app",
  "https://call-agent-dashboard-omgcw6a9f-sachinottawas-projects.vercel.app",
];

/**
 * Check Upload Exists API
 *
 * Purpose:
 * - Determines whether a dataset already exists for a given email
 * - Used by frontend to decide:
 *   → show overwrite confirmation
 *   → or allow fresh upload directly
 *
 * Data model:
 * - uploads table contains ONE row per email
 * - Presence of a row means data already exists
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  /**
   * ------------------------
   * CORS handling
   * ------------------------
   */
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  /**
   * ------------------------
   * Query validation
   * ------------------------
   */
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  /**
   * ------------------------
   * Upload existence check
   * ------------------------
   *
   * Business rule:
   * - Each email can have only one upload
   * - If a row exists in uploads → data already present
   *
   * We only fetch the ID since existence is all we care about.
   */
  const { data, error } = await supabase
    .from("uploads")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to check upload status",
    });
  }

  /**
   * ------------------------
   * Response
   * ------------------------
   *
   * exists = true  → frontend should ask for overwrite confirmation
   * exists = false → frontend can proceed with upload
   */
  return res.status(200).json({
    exists: data.length > 0,
  });
}
