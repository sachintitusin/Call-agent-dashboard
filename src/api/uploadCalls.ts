type CallEvent = {
  timestamp: string;
  converted: boolean;
};

export async function uploadCalls(
  email: string,
  events: CallEvent[]
): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  const res = await fetch(`${baseUrl}/api/upload-calls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      events,
    }),
  });

  if (!res.ok) {
    let message = "Failed to upload call data";

    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }
}
