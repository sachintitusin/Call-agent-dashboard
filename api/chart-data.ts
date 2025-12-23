import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Allowed browser origins
 * - localhost for dev
 * - your Vercel domain for prod
 */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://call-analysis-black.vercel.app",
];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const origin = req.headers.origin;

  // ✅ Allow only known frontends
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin"); // important for caches
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ---- normal logic below ----
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const { data, error } = await supabase.rpc(
    "get_hourly_call_stats",
    { p_email: email }
  );

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch chart data" });
  }

  return res.status(200).json({ chartData: data });
}
