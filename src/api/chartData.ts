export async function fetchChartData(email: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/chart-data?email=${encodeURIComponent(email)}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch chart data');
  }

  const data = await res.json();
  return data.chartData;
}
