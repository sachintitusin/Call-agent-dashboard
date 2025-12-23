export async function checkUploadExists(email: string): Promise<boolean> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  const res = await fetch(
    `${baseUrl}/api/check-upload?email=${encodeURIComponent(email)}`
  );

  if (!res.ok) {
    throw new Error("Failed to check upload existence");
  }

  const data: { exists: boolean } = await res.json();
  return data.exists;
}
