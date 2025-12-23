import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type OutcomePoint = {
  label: string;
  value: number;
};

type Props = {
  data: OutcomePoint[];
};

const COLORS = [
  "#40E5E3",               // Successful
  "#C48C66",               // Escalated
  "#D85FCB",               // Failed
  "var(--color-text-muted)" // Dropped
];

export default function ConversationOutcomeDonut({ data }: Props) {
  // find success value for center display
  const success = data.find((d) => d.label === "Successful")?.value ?? null;

  return (
    <div className="flex h-full flex-col">
      {/* Title */}
      <h3 className="mb-8 text-sm font-medium text-text-primary">
        Conversation outcome mix
      </h3>

      {/* Content */}
      <div className="flex flex-1 items-center gap-10">
        {/* Donut */}
        <div className="relative h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

                <Tooltip
                formatter={(value, name) => {
                    if (typeof value === "number") {
                    return [`${value}%`, `conversations`];
                    }
                    return [value, name];
                }}
                contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    borderRadius: 12,
                    border: "none",
                    fontSize: 12,
                    padding: "8px 10px",
                }}
                itemStyle={{
                    color: "var(--color-text-primary)",
                }}
                labelStyle={{
                    display: "none",
                }}
                />

              {/* Center value */}
              {success !== null && (
                <>
                  <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#40E5E3"
                    fontSize={18}
                    fontWeight={600}
                  >
                    {success}%
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    fill="var(--color-text-muted)"
                    fontSize={12}
                  >
                    Successful
                  </text>
                </>
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center gap-3 text-sm text-text-secondary"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="min-w-[90px]">{item.label}</span>
              <span className="text-text-muted">{item.value}%</span>
            </div>
          ))}
        </div>
        
      </div>
      <div className="mt-8 border-t border-white/5 pt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
            Suggested actions
        </p>

        <div className="flex flex-wrap gap-3">
            <button
            className="
                rounded-full
                border border-border-subtle
                px-4 py-2
                text-xs text-text-secondary
                transition
                hover:border-brand-primary
                hover:text-text-primary
            "
            >
            Review failed conversations
            </button>

            <button
            className="
                rounded-full
                border border-border-subtle
                px-4 py-2
                text-xs text-text-secondary
                transition
                hover:border-brand-primary
                hover:text-text-primary
            "
            >
            Inspect escalation rules
            </button>

            <button
            className="
                rounded-full
                border border-border-subtle
                px-4 py-2
                text-xs text-text-secondary
                transition
                hover:border-brand-primary
                hover:text-text-primary
            "
            >
            Compare with last week
            </button>
        </div>
        </div>

    </div>
  );
}
