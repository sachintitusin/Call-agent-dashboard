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

  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  // ✅ Correct: check uploads table
  const { data, error } = await supabase
    .from("uploads")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to check upload status" });
  }

  return res.status(200).json({
    exists: data.length > 0,
  });
}
