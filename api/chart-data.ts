import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client
 *
 * Used for read-only analytics queries via a Postgres RPC function.
 * No direct table access from this endpoint.
 */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Allowed browser origins
 *
 * Restricts access to known frontend deployments only.
 * Prevents unauthorized usage of analytics endpoints.
 */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://call-agent-dashboard.vercel.app",
  "https://call-agent-dashboard-omgcw6a9f-sachinottawas-projects",
];

/**
 * Get Hourly Call Statistics API
 *
 * Purpose:
 * - Fetch aggregated call performance data for charts
 * - Used by dashboard visualizations (hourly conversion, volume, etc.)
 *
 * Data source:
 * - PostgreSQL RPC function: get_hourly_call_stats(email)
 * - Aggregation logic lives in the database, not in the API
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

  // Allow only known frontend origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin"); // important for proxy/cache correctness
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
   * Fetch aggregated chart data
   * ------------------------
   *
   * The RPC function:
   * - Accepts email as input
   * - Resolves upload → call_events internally
   * - Returns pre-aggregated hourly metrics
   *
   * This keeps:
   * - API thin
   * - Business logic centralized in the DB
   */
  const { data, error } = await supabase.rpc(
    "get_hourly_call_stats",
    { p_email: email }
  );

  if (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch chart data",
    });
  }

  /**
   * ------------------------
   * Response
   * ------------------------
   *
   * chartData is returned as-is from the database
   * and directly consumed by frontend charts.
   */
  return res.status(200).json({ chartData: data });
}
