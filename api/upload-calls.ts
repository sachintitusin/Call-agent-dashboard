import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://call-agent-dashboard.vercel.app",
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

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, events } = req.body as {
    email?: string;
    events?: { timestamp: string; converted: boolean }[];
  };

  if (!email || !Array.isArray(events)) {
    return res.status(400).json({
      error: "email and events[] are required",
    });
  }

  // 1️⃣ Check existing upload
  const { data: existing } = await supabase
    .from("uploads")
    .select("id")
    .eq("email", email)
    .single();

  // 2️⃣ If exists → delete upload (cascade clears call_events)
  if (existing) {
    const { error: deleteError } = await supabase
      .from("uploads")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.error(deleteError);
      return res.status(500).json({ error: "Failed to overwrite upload" });
    }
  }

  // 3️⃣ Create new upload
  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .insert({ email })
    .select("id")
    .single();

  if (uploadError || !upload) {
    console.error(uploadError);
    return res.status(500).json({ error: "Failed to create upload" });
  }

  // 4️⃣ Insert call_events
  const rows = events.map((e) => ({
    upload_id: upload.id,
    timestamp: e.timestamp,
    converted: e.converted,
  }));

  const { error: eventsError } = await supabase
    .from("call_events")
    .insert(rows);

  if (eventsError) {
    console.error(eventsError);
    return res.status(500).json({ error: "Failed to insert call events" });
  }

  return res.status(200).json({ success: true });
}
