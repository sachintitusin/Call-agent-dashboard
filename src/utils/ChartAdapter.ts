type ApiChartRow = {
  hour: number;
  total: number;
  converted: number;
  conversion_rate: number;
};

type ChartPoint = {
  hour: string;
  conversion: number;
};

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

export function adaptChartData(apiData: ApiChartRow[]): ChartPoint[] {
  return apiData.map((row) => ({
    hour: formatHour(row.hour),
    conversion: row.conversion_rate,
  }));
}
