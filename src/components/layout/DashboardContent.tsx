import HourlyConversionChart from "../charts/HourlyConversionChart";

export default function DashboardContent() {
  return (
    <main className="relative flex-1 overflow-y-auto bg-app">
      {/* Top ambient gradient (full width) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] app-top-gradient" />

      {/* Content wrapper */}
      <div className="relative px-8 py-16">
        <div className="mx-auto max-w-7xl">
          {/* HERO SECTION */}
          <section className="grid grid-cols-1 gap-14 lg:grid-cols-2">
            {/* LEFT: Insight narrative */}
            <div className="flex max-w-xl flex-col justify-center">
              {/* Greeting */}
              <p className="mb-3 text-sm text-text-muted">
                👋 Good morning, Sally
              </p>

              {/* Insight heading */}
              <h2 className="mb-4 text-3xl font-semibold leading-tight text-text-primary">
                Mid-day calls are converting better today
              </h2>

              {/* Supporting paragraph */}
              <p className="mb-8 text-sm leading-relaxed text-text-secondary">
                Recent call patterns show higher success rates between 11 AM and
                2 PM, indicating increased customer readiness during this
                window.
              </p>

              {/* Suggestions */}
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

              {/* Primary CTA */}
              <div>
                <button className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
                  Upload new call data
                </button>
              </div>
            </div>

            {/* RIGHT: Chart */}
            <div className="flex items-stretch">
              <div className="relative w-full rounded-2xl bg-surface/30 p-4">
                <HourlyConversionChart />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
