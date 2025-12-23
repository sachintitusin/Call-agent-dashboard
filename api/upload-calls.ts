import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client
 *
 * Uses anon key because:
 * - This function runs server-side
 * - Database access is controlled via RLS (or explicitly disabled)
 */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Explicit CORS allowlist
 *
 * Only dashboard clients are allowed to upload data.
 * This prevents unauthorized third-party usage of the API.
 */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://call-agent-dashboard.vercel.app",
];

/**
 * Upload Call Events API
 *
 * Data model:
 * - uploads (id, email, created_at)
 * - call_events (id, upload_id, timestamp, converted)
 *
 * Rules:
 * - One email can have only ONE upload at a time
 * - Uploading again for the same email overwrites old data
 * - Deleting an upload CASCADE deletes its call_events
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

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  /**
   * ------------------------
   * Method validation
   * ------------------------
   */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /**
   * ------------------------
   * Input validation
   * ------------------------
   */
  const { email, events } = req.body as {
    email?: string;
    events?: { timestamp: string; converted: boolean }[];
  };

  if (!email || !Array.isArray(events)) {
    return res.status(400).json({
      error: "email and events[] are required",
    });
  }

  /**
   * ------------------------
   * Overwrite logic (idempotent upload)
   * ------------------------
   *
   * Business rule:
   * - Each email represents a single dataset
   * - Re-uploading replaces previous data entirely
   */
  const { data: existing } = await supabase
    .from("uploads")
    .select("id")
    .eq("email", email)
    .single();

  /**
   * If an upload already exists for this email:
   * - Delete the upload row
   * - Supabase foreign key CASCADE deletes call_events
   */
  if (existing) {
    const { error: deleteError } = await supabase
      .from("uploads")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.error(deleteError);
      return res.status(500).json({
        error: "Failed to overwrite existing upload",
      });
    }
  }

  /**
   * ------------------------
   * Create new upload entry
   * ------------------------
   *
   * This represents the latest dataset for the email
   */
  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .insert({ email })
    .select("id")
    .single();

  if (uploadError || !upload) {
    console.error(uploadError);
    return res.status(500).json({
      error: "Failed to create upload",
    });
  }

  /**
   * ------------------------
   * Insert call events
   * ------------------------
   *
   * All events are linked to the upload via upload_id
   */
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
    return res.status(500).json({
      error: "Failed to insert call events",
    });
  }

  /**
   * ------------------------
   * Success response
   * ------------------------
   */
  return res.status(200).json({ success: true });
}
