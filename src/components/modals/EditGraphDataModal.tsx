import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal";

import { GRAPH_HOURS } from "../../constants/graphHours";
import type { GraphHour } from "../../constants/graphHours";

import { getUserGraphData } from "../../api/getUserGraphData";
import { saveGraphData } from "../../api/saveGraphData";

type FormValues = {
  email: string;
  data: Record<GraphHour, number>;
};
type ChartPoint = {
  hour: string;
  conversion: number;
};

type Props = {
  initialData: ChartPoint[];
  onClose: () => void;
  onSaveSuccess: (email: string, data: ChartPoint[]) => void;
};

export default function EditGraphDataModal({
  initialData,
  onClose,
  onSaveSuccess,
}: Props) {
  const [checking, setChecking] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [inputsEnabled, setInputsEnabled] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

    const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      data: chartPointsToRecord(initialData),
    },
  });

  useEffect(() => {
    reset({
      email: "",
      data: chartPointsToRecord(initialData),
    });
  }, [initialData, reset]);

  function chartPointsToRecord(
    points: ChartPoint[]
  ): Record<GraphHour, number> {
    return GRAPH_HOURS.reduce((acc, hour) => {
      const match = points.find((p) => p.hour === hour);
      acc[hour] = match ? match.conversion : 0;
      return acc;
    }, {} as Record<GraphHour, number>);
  }

  function recordToChartPoints(
    data: Record<GraphHour, number>
  ): ChartPoint[] {
    return GRAPH_HOURS.map((hour) => ({
      hour,
      conversion: data[hour],
    }));
  }

  const email = watch("email");

  /* --------------------------------
   * Fetch + prefill on email change
   * --------------------------------*/
  useEffect(() => {
    if (!email || !email.includes("@")) {
      setAlreadyExists(false);
      setInputsEnabled(false);
      return;
    }

    let active = true;

    async function fetchAndPrefill() {
      try {
        setChecking(true);
        setInputsEnabled(false);

        const result = await getUserGraphData(email);
        if (!active) return;

        if (result.exists) {
          const filledData = GRAPH_HOURS.reduce((acc, hour) => {
            const match = result.data.find((d) => d.hour === hour);
            acc[hour] = match ? match.conversion : 0;
            return acc;
          }, {} as Record<GraphHour, number>);

          reset({ email, data: filledData });
          setAlreadyExists(true);
        } else {
          // reset({
          //   email,
          //   data: GRAPH_HOURS.reduce((acc, hour) => {
          //     acc[hour] = 0;
          //     return acc;
          //   }, {} as Record<GraphHour, number>),
          // });
          reset({
            email,
            data: chartPointsToRecord(initialData),
          });
          setAlreadyExists(false);
        }

        setInputsEnabled(true);
      } catch (err) {
        console.error("Failed to fetch graph data", err);
        setInputsEnabled(false);
      } finally {
        if (active) setChecking(false);
      }
    }

    fetchAndPrefill();
    return () => {
      active = false;
    };
  }, [email, reset]);

  /* --------------------------------
   * Submit handler
   * --------------------------------*/
  async function onSubmit(values: FormValues) {
    try {
      setSubmitError(null);

      await saveGraphData(values.email, values.data);
      await saveGraphData(values.email, values.data);

      const updatedChartData = recordToChartPoints(values.data);
      onSaveSuccess(values.email, updatedChartData);
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to save conversion data");
      }
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-6 text-lg font-semibold text-text-primary">
        Add / Edit Conversion Data
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email input with spinner */}
        <div>
          <label className="mb-2 block text-xs text-text-muted">
            User Email
          </label>

          <div
            className="
              relative flex items-center
              h-12
              rounded-full
              bg-white/5
              border border-white/10
              focus-within:border-brand-primary
              focus-within:ring-2 focus-within:ring-brand-primary/30
            "
          >
          <input
            type="email"
            placeholder="you@company.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address",
              },
            })}
            className="
              w-full h-full
              bg-transparent
              px-5 pr-10
              text-sm text-text-primary
              placeholder:text-text-muted
              focus:outline-none
              selection:bg-brand-primary/30
              selection:text-text-primary
            "
          />

            {checking && (
              <div className="absolute right-4">
                <div
                  className="
                    h-4 w-4
                    animate-spin
                    rounded-full
                    border-2 border-white/30
                    border-t-transparent
                  "
                />
              </div>
            )}
          </div>

          {errors.email && (
            <p className="mt-1 text-xs text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Hourly conversion table */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
            Hourly conversion (%)
          </p>

          <div className="max-h-[320px] overflow-y-auto rounded-xl border border-white/10">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-app/95 backdrop-blur">
                <tr>
                  <th className="px-3 py-2 w-20 text-left font-medium text-text-secondary">
                    Hour
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">
                    Conversion (%)
                  </th>
                </tr>
              </thead>

              <tbody>
                {GRAPH_HOURS.map((hour) => (
                  <tr key={hour} className="border-t border-white/10">
                    <td className="px-3 py-2 text-text-secondary">
                      {hour}
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        disabled={!inputsEnabled}
                        {...register(`data.${hour}`, {
                          valueAsNumber: true,
                          required: true,
                          min: { value: 0, message: "Min 0%" },
                          max: { value: 100, message: "Max 100%" },
                        })}
                        className={`
                          w-full h-8 rounded-md px-3 text-xs
                          border border-white/10
                          focus:outline-none focus:border-brand-primary
                          ${
                            inputsEnabled
                              ? "bg-white/5 text-text-primary"
                              : "bg-white/3 text-text-muted cursor-not-allowed"
                          }
                        `}
                      />

                      {errors.data?.[hour] && (
                        <p className="mt-0.5 text-[10px] text-red-400">
                          {errors.data[hour]?.message}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-1 text-[10px] text-text-muted">
            Enter conversion percentages for each hour (0–100).
          </p>
        </div>

        {/* Overwrite warning */}
        {alreadyExists && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm">
            <span className="mt-0.5 text-yellow-400">⚠️</span>
            <div className="text-yellow-200">
              <p className="font-medium">Existing data found</p>
              <p className="mt-0.5 text-yellow-200/80">
                Saving will overwrite the current conversion data for
                this email.
              </p>
            </div>
          </div>
        )}

        {submitError && (
          <p className="text-sm text-red-400">{submitError}</p>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-sm text-text-secondary hover:text-text-primary transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !inputsEnabled}
            className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Save data"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
