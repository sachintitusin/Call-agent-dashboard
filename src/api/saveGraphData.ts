export async function saveGraphData(
  email: string,
  data: Record<string, number>
): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  const res = await fetch(`${baseUrl}/api/save-graph-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      data,
    }),
  });

  if (!res.ok) {
    let message = "Failed to save graph data";

    try {
      const err = await res.json();
      if (err?.error) {
        message = err.error;
      }
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }
}
