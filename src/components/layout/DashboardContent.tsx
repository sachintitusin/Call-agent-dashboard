import { useEffect, useState } from "react";
import HourlyConversionChart from "../charts/HourlyConversionChart";
import { fetchChartData } from "../../api/chartData";
import { adaptChartData } from "../../utils/ChartAdapter";

type ChartPoint = {
  hour: string;
  conversion: number;
};

export default function DashboardContent() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(false);

        // TODO: replace with real user email later
        const email = "sally@company.com";

        const apiData = await fetchChartData(email);
        console.log(apiData)
        const adapted = adaptChartData(apiData);

        setChartData(adapted);
      } catch (err) {
        console.error("Failed to load chart data", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="relative flex-1 overflow-y-auto bg-app">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] app-top-gradient" />

      <div className="relative px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <section className="grid grid-cols-1 gap-14 lg:grid-cols-2">

            {/* LEFT: Insight narrative */}
            <div className="flex max-w-xl flex-col justify-center">
              <p className="mb-3 text-sm text-text-muted">
                👋 Good morning, Sally
              </p>

              <h2 className="mb-4 text-3xl font-semibold leading-tight text-text-primary">
                Mid-day calls are converting better today
              </h2>

              <p className="mb-8 text-sm leading-relaxed text-text-secondary">
                Recent call patterns show higher success rates between 11 AM and
                2 PM, indicating increased customer readiness during this
                window.
              </p>

              <div className="mb-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                  You might want to explore
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Shift more agents to peak mid-day hours",
                    "Review sentiment trends in failed calls",
                    "Compare today’s performance with earlier this week",
                  ].map((item) => (
                    <button
                      key={item}
                      className="rounded-lg border border-border-subtle px-3 py-2 text-xs text-text-secondary transition hover:border-brand-primary hover:text-text-primary"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
                Upload new call data
              </button>
            </div>

            {/* RIGHT: Chart */}
            <div className="flex items-stretch">
              <div className="relative w-full min-h-[260px] rounded-2xl bg-surface/30 p-4">
                {loading && (
                  <p className="text-sm text-text-muted">Loading chart…</p>
                )}

                {!loading && error && (
                  <p className="text-sm text-red-400">
                    Failed to load chart data
                  </p>
                )}

                {!loading && !error && chartData.length > 0 && (
                  <HourlyConversionChart data={chartData} />
                )}

                {!loading && !error && chartData.length === 0 && (
                  <p className="text-sm text-text-muted">
                    No call data uploaded yet
                  </p>
                )}
              </div>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
