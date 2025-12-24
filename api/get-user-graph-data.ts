import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://call-agent-dashboard.vercel.app",
  "https://call-agent-dashboard-omgcw6a9f-sachinottawas-projects.vercel.app",
];

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

  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* ------------------------
   * Validation
   * ------------------------ */
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  /* ------------------------
   * Fetch user
   * ------------------------ */
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (userError) {
    console.error("Failed to fetch user", userError);
    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }

  if (!users || users.length === 0) {
    return res.status(200).json({ exists: false });
  }

  const userId = users[0].id;

  /* ------------------------
   * Fetch graph data
   * ------------------------ */
  const { data: graphData, error: graphError } = await supabase
    .from("graph_data")
    .select("hour_label, conversion_percentage")
    .eq("user_id", userId)
    .order("hour_label", { ascending: true });

  if (graphError) {
    console.error("Failed to fetch graph data", graphError);
    return res.status(500).json({
      error: "Failed to fetch graph data",
    });
  }

  /* ------------------------
   * Response
   * ------------------------ */
  return res.status(200).json({
    exists: true,
    data: graphData.map((row) => ({
      hour: row.hour_label,
      conversion: row.conversion_percentage,
    })),
  });
}
