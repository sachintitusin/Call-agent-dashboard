import { GRAPH_HOURS } from "../constants/graphHours";
import type { GraphHour } from "../constants/graphHours";


type ChartPoint = {
  hour: string;
  conversion: number;
};

/**
 * Sorts chart data according to the fixed hour order
 * defined in GRAPH_HOURS.
 *
 * Safe because:
 * - hour labels are controlled
 * - finite set
 * - deterministic order
 */
export function sortByHourOrder(
  data: ChartPoint[]
): ChartPoint[] {
  const orderMap = new Map<GraphHour, number>(
    GRAPH_HOURS.map((hour, index) => [hour, index])
  );

  return [...data].sort((a, b) => {
    const aIndex = orderMap.get(a.hour as GraphHour) ?? 999;
    const bIndex = orderMap.get(b.hour as GraphHour) ?? 999;
    return aIndex - bIndex;
  });
}
