import { useEffect, useState, useCallback } from "react";
import HourlyConversionChart from "../charts/HourlyConversionChart";
import UploadCallDataModal from "../modals/UploadCallDataModal";
import ConversationOutcomeDonut from "../charts/ConversationOutcomeDonut";
import DropOffFunnel from "../charts/DropOffFunnel";

import { fetchChartData } from "../../api/chartData";
import { adaptChartData } from "../../utils/ChartAdapter";

type ChartPoint = {
  hour: string;
  conversion: number;
};

export default function DashboardContent() {
  // 🔑 which email’s data is currently shown
  const [activeEmail, setActiveEmail] = useState<string | null>(null);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  /* --------------------------------
   * Single source of truth for fetch
   * --------------------------------*/
  const loadChartData = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(false);

      const apiData = await fetchChartData(email);
      const adapted = adaptChartData(apiData);

      setChartData(adapted);
    } catch (err) {
      console.error("Failed to load chart data", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /* --------------------------------
   * Initial load (optional default)
   * --------------------------------*/
  useEffect(() => {
    // Optional: initial email to show on dashboard load
    const defaultEmail = "sally@company.com";
    setActiveEmail(defaultEmail);
    loadChartData(defaultEmail);
  }, [loadChartData]);

  /* --------------------------------
   * Called when upload succeeds
   * --------------------------------*/
  function handleUploadSuccess(uploadedEmail: string) {
    setIsUploadOpen(false);
    setActiveEmail(uploadedEmail);
    loadChartData(uploadedEmail);
  }

  return (
    <main className="relative flex-1 overflow-y-auto bg-app">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] app-top-gradient" />

      <div className="relative px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <section className="grid grid-cols-1 gap-14 lg:grid-cols-2">

            {/* LEFT: Insight narrative */}
            <div className="flex max-w-xl flex-col justify-center">
              <p className="mb-3 text-sm text-text-muted">
                👋 Good morning{activeEmail ? "," : ""}{" "}
                {activeEmail ? activeEmail.split("@")[0] : "there"}
              </p>

              <h2 className="mb-4 text-3xl font-semibold leading-tight text-text-primary">
                Mid-day calls are converting better
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

              <button
                onClick={() => setIsUploadOpen(true)}
                className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white"
              >
                Upload new call data
              </button>
            </div>

            {/* RIGHT: Chart */}
            <div className="flex items-stretch">
              <div className="relative w-full min-h-[260px] rounded-2xl bg-surface/30 p-4">

                {!activeEmail && (
                  <p className="text-sm text-text-muted">
                    Upload call data to see insights
                  </p>
                )}

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

                {!loading && !error && activeEmail && chartData.length === 0 && (
                  <p className="text-sm text-text-muted">
                    No call data found for <b>{activeEmail}</b>
                  </p>
                )}
              </div>
            </div>

          </section>
          <section className="mt-16">
            <h2 className="mb-6 text-lg font-semibold text-text-primary">
              Sad path analysis
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* LEFT: Conversation outcome mix (1/3) */}
              <div className="lg:col-span-1 rounded-2xl bg-surface/30 px-6 py-5">
                <ConversationOutcomeDonut
                  data={[
                    { label: "Successful", value: 54 },
                    { label: "Escalated", value: 18 },
                    { label: "Failed", value: 20 },
                    { label: "Dropped", value: 8 },
                  ]}
                />
              </div>

              {/* RIGHT: Drop-off funnel (2/3) */}
              <div className="lg:col-span-2 rounded-2xl bg-surface/30 px-6 py-5">
                <DropOffFunnel
                  data={[
                    { stage: "Call started", remaining: 100 },
                    { stage: "Verification", remaining: 78 },
                    { stage: "Intent understood", remaining: 61 },
                    { stage: "Resolution", remaining: 54 },
                  ]}
                />
              </div>
            </div>
          </section>





        </div>
      </div>

      {/* Upload modal */}
      {isUploadOpen && (
        <UploadCallDataModal
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </main>
  );
}
