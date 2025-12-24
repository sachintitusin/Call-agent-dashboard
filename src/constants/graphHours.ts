// src/constants/graphHours.ts
export const GRAPH_HOURS = [
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
] as const;

export type GraphHour = typeof GRAPH_HOURS[number];
