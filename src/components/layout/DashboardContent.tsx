import { useEffect, useState, useCallback } from "react";

import HourlyConversionChart from "../charts/HourlyConversionChart";
import UploadCallDataModal from "../modals/UploadCallDataModal";
import EditGraphDataModal from "../modals/EditGraphDataModal";
import ConversationOutcomeDonut from "../charts/ConversationOutcomeDonut";
import DropOffFunnel from "../charts/DropOffFunnel";

import { getUserGraphData } from "../../api/getUserGraphData";
import { sortByHourOrder } from "../../utils/sortByHourOrder";

type ChartPoint = {
  hour: string;
  conversion: number;
};

export default function DashboardContent() {
  /* --------------------------------
   * State
   * --------------------------------*/
  const [activeEmail, setActiveEmail] = useState<string | null>(null);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  /* --------------------------------
   * Load chart data (single source)
   * --------------------------------*/
  const loadUserChartData = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(false);

      const result = await getUserGraphData(email);

      if (!result.exists) {
        setChartData([]);
        return;
      }

      // ✅ ENSURE DETERMINISTIC HOUR ORDER
      const sorted = sortByHourOrder(result.data);
      setChartData(sorted);
    } catch (err) {
      console.error("Failed to load user chart data", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /* --------------------------------
   * Initial load (demo user)
   * --------------------------------*/
  useEffect(() => {
    const defaultEmail = "sally@company.com";
    setActiveEmail(defaultEmail);
    loadUserChartData(defaultEmail);
  }, [loadUserChartData]);

  /* --------------------------------
   * Called when any data update succeeds
   * --------------------------------*/
  function handleDataSuccess(email: string) {
    setIsUploadOpen(false);
    setIsEditOpen(false);
    setActiveEmail(email);
    loadUserChartData(email);
  }

  return (
    <main className="relative flex-1 overflow-y-auto bg-app">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] app-top-gradient" />

      <div className="relative px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <section className="grid grid-cols-1 gap-14 lg:grid-cols-2">
            {/* LEFT: Narrative */}
            <div className="flex max-w-xl flex-col justify-center">
              <p className="mb-3 text-sm text-text-muted">
                👋 Good morning{activeEmail ? "," : ""}{" "}
                {activeEmail ? activeEmail.split("@")[0] : "there"}
              </p>

              <h2 className="mb-4 text-3xl font-semibold leading-tight text-text-primary">
                Conversion performance by hour
              </h2>

              <p className="mb-8 text-sm leading-relaxed text-text-secondary">
                Review how conversion rates vary across different hours of the
                day for the selected user.
              </p>

              <div className="mb-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                  You might want to explore
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Shift more agents to high-performing hours",
                    "Investigate low-conversion periods",
                    "Compare performance across users",
                  ].map((item) => (
                    <button
                      key={item}
                      className="rounded-lg cursor-pointer border border-border-subtle px-3 py-2 text-xs text-text-secondary transition hover:border-brand-primary hover:text-text-primary"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="rounded-lg bg-brand-primary px-6 py-3 text-sm cursor-pointer font-medium text-white shadow-sm transition hover:bg-brand-primary/90"
                >
                  Add / edit call data
                </button>

                {/* <button
                  onClick={() => setIsUploadOpen(true)}
                  className="rounded-lg border border-border-subtle px-5 py-3 text-sm font-medium text-text-secondary transition hover:border-brand-primary hover:text-text-primary"
                >
                  Upload JSON
                </button> */}
              </div>
            </div>

            {/* RIGHT: Chart */}
            <div className="flex items-stretch">
              <div className="relative w-full min-h-[260px] rounded-2xl bg-surface/30 p-4">
                {!activeEmail && (
                  <p className="text-sm text-text-muted">
                    Select a user to view insights
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
                    No conversion data found for <b>{activeEmail}</b>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* SECONDARY SECTION */}
          <section className="mt-20">
            <h2 className="mb-8 text-xl font-semibold text-text-primary">
              Conversation friction & outcomes
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

      {/* MODALS */}
      {isUploadOpen && (
        <UploadCallDataModal
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleDataSuccess}
        />
      )}

      {isEditOpen && (
        <EditGraphDataModal
          initialData={chartData}
          onClose={() => setIsEditOpen(false)}
          onSaveSuccess={(email, updatedData) => {
            setChartData(updatedData);
            setIsEditOpen(false);
          }}
        />
      )}
    </main>
  );
}
