import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceArea,
} from "recharts";

type FunnelPoint = {
  stage: string;
  remaining: number;
};

type Props = {
  data: FunnelPoint[];
};

/**
 * Custom X-axis tick renderer
 * - Adds vertical spacing
 * - Nudges first label away from Y-axis text
 */
function renderXAxisTick(props: any) {
  const { x, y, payload, index } = props;

  return (
    <text
      x={index === 0 ? x + 10 : x}
      y={y + 14}
      textAnchor="middle"
      fill="var(--color-text-muted)"
      fontSize={11}
    >
      {payload.value}
    </text>
  );
}

export default function DropOffFunnel({ data }: Props) {
  return (
    <div className="flex h-full flex-col">
      {/* Section title */}
      <h3 className="mb-8 text-sm font-medium tracking-wide text-text-primary">
        Conversation drop-off funnel
      </h3>

      {/* Chart */}
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
          >
            {/* Subtle phase bands */}
            <ReferenceArea
              x1="Call started"
              x2="Verification"
              fill="var(--color-border-subtle)"
              fillOpacity={0.06}
            />

            <ReferenceArea
              x1="Verification"
              x2="Intent understood"
              fill="#D669CE"
              fillOpacity={0.06}
            />

            <ReferenceArea
              x1="Intent understood"
              x2="Resolution"
              fill="var(--color-border-subtle)"
              fillOpacity={0.04}
            />

            <XAxis
              dataKey="stage"
              padding={{ left: 20, right: 20 }}
              axisLine={false}
              tickLine={false}
              tick={renderXAxisTick}
            />

            <YAxis
              domain={[0, 100]}
              width={40}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 11,
              }}
            />

            <Tooltip
                formatter={(value) => {
                    if (typeof value === "number") {
                    return [`${value}%`, "Remaining"];
                    }
                    return [value, "Remaining"];
                }}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                borderRadius: 12,
                border: "none",
                fontSize: 12,
              }}
            />

            <Line
              type="monotone"
              dataKey="remaining"
              stroke="#40E5E3"
              strokeWidth={3}
              dot={{ r: 4, fill: "#40E5E3" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Supporting insight */}
      <p className="mt-6 text-xs leading-relaxed text-text-muted">
        Largest drop-offs occur during verification, followed by stabilization
        once intent is clearly understood.
      </p>
    </div>
  );
}
