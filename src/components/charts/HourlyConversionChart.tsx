import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ChartPoint = {
  hour: string;
  conversion: number;
};

type Props = {
  data: ChartPoint[];
};

export default function HourlyConversionChart({ data }: Props) {
  return (
    <div className="flex h-full flex-col">
      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="hour"
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                borderRadius: 12,
                border: "none",
                color: "var(--color-text-primary)",
                fontSize: 12,
              }}
              formatter={(value) => {
                if (typeof value === "number") {
                  return [`${value}%`, "Conversion"];
                }
                return [value, "Conversion"];
              }}
            />

            <Bar
              dataKey="conversion"
              fill="var(--color-brand-primary)"
              radius={[999, 999, 999, 999]}
              barSize={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Caption */}
      <p className="mt-3 text-xs leading-relaxed text-text-muted">
        Shows the percentage of successful calls by hour. Conversion rates peak
        between <span className="text-text-secondary">11 AM and 2 PM</span>,
        indicating higher customer readiness during mid-day hours.
      </p>
    </div>
  );
}
