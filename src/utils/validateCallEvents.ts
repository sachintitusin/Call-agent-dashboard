type CallEvent = {
  timestamp: string;
  converted: boolean;
};

function isValidISODate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function validateCallEvents(data: unknown): CallEvent[] {
  if (!Array.isArray(data)) {
    throw new Error("JSON must be an array of call events");
  }

  data.forEach((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Event at index ${index} is not an object`);
    }

    const event = item as Record<string, unknown>;

    if (typeof event.timestamp !== "string") {
      throw new Error(`Missing or invalid timestamp at index ${index}`);
    }

    if (!isValidISODate(event.timestamp)) {
      throw new Error(`Invalid ISO timestamp at index ${index}`);
    }

    if (typeof event.converted !== "boolean") {
      throw new Error(`Missing or invalid converted flag at index ${index}`);
    }
  });

  return data as CallEvent[];
}
