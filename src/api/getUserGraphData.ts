export type UserGraphDataPoint = {
  hour: string;
  conversion: number;
};

export type GetUserGraphDataResponse =
  | {
      exists: false;
    }
  | {
      exists: true;
      data: UserGraphDataPoint[];
    };

export async function getUserGraphData(
  email: string
): Promise<GetUserGraphDataResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  const res = await fetch(
    `${baseUrl}/api/get-user-graph-data?email=${encodeURIComponent(email)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user graph data");
  }

  const data = (await res.json()) as GetUserGraphDataResponse;
  return data;
}
