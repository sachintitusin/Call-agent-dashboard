import { useState, useRef } from "react";
import Modal from "./Modal";

import { validateCallEvents } from "../../utils/validateCallEvents";
import { checkUploadExists } from "../../api/checkUpload";
import { uploadCalls } from "../../api/uploadCalls";

type Props = {
  onClose: () => void;
  onUploadSuccess: (email: string) => void;
};

export default function UploadCallDataModal({ onClose, onUploadSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [checking, setChecking] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* -----------------------------
   * Email existence check
   * ----------------------------*/
  async function handleEmailBlur() {
    if (!email || !email.includes("@")) return;

    try {
      setChecking(true);
      const exists = await checkUploadExists(email);
      setAlreadyExists(exists);
    } catch (err) {
      console.error("Failed to check upload status", err);
    } finally {
      setChecking(false);
    }
  }

  /* -----------------------------
   * File selection
   * ----------------------------*/
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/json") {
      setError("Only JSON files are supported");
      setFile(null);
      setFileName(null);
      return;
    }

    setError(null);
    setFile(selected);
    setFileName(selected.name);
  }

  /* -----------------------------
   * File parsing + validation
   * ----------------------------*/
  async function parseAndValidateFile(file: File) {
    let parsed: unknown;

    try {
      const text = await file.text();
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON file");
    }

    return validateCallEvents(parsed);
  }

  /* -----------------------------
   * Submit upload
   * ----------------------------*/
  async function handleSubmit() {
    try {
      if (!email) throw new Error("Email is required");
      if (!file) throw new Error("Please upload a JSON file");

      setUploading(true);
      setError(null);

      const events = await parseAndValidateFile(file);
      await uploadCalls(email, events);

      // ✅ Notify dashboard which email was updated
      onUploadSuccess(email);

    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }


  return (
    <Modal onClose={onClose}>
      <h3 className="mb-6 text-lg font-semibold text-text-primary">
        Upload Call Data
      </h3>

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label className="mb-2 block text-xs text-text-muted">
            User Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            placeholder="you@company.com"
            className="
              w-full h-12
              rounded-full
              bg-white/5
              px-5
              text-sm text-text-primary
              placeholder:text-text-muted
              border border-white/10
              focus:outline-none
              focus:border-brand-primary
              focus:ring-2 focus:ring-brand-primary/30
            "
          />
        </div>

        {/* File upload */}
        <div>
          <label className="mb-2 block text-xs text-text-muted">
            Call data (JSON only)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="
              flex h-12 w-full items-center justify-between
              rounded-full
              bg-white/5
              px-5
              text-sm
              border border-white/10
              transition
              hover:border-brand-primary/60
            "
          >
            <span className="text-text-secondary">
              {fileName ?? "Choose JSON file"}
            </span>
            <span className="font-medium text-brand-primary">
              Browse
            </span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Overwrite warning */}
      {alreadyExists && (
        <div
          className="
            mt-6
            flex items-start gap-3
            rounded-xl
            border border-yellow-400/30
            bg-yellow-400/10
            px-4 py-3
            text-sm
          "
        >
          <span className="mt-0.5 text-yellow-400">⚠️</span>
          <div className="text-yellow-200">
            <p className="font-medium">Existing data found</p>
            <p className="mt-0.5 text-yellow-200/80">
              Uploading new call data will overwrite the current dataset for
              this email.
            </p>
          </div>
        </div>
      )}

      {checking && (
        <p className="mt-2 text-xs text-text-muted">
          Checking existing uploads…
        </p>
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={onClose}
          className="
            rounded-full
            px-5 py-2
            text-sm text-text-secondary
            hover:text-text-primary
            transition
          "
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="
            h-11
            rounded-full
            bg-brand-primary
            px-6
            text-sm font-semibold
            text-white
            transition
            hover:opacity-90
            disabled:opacity-50
          "
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    </Modal>
  );
}
