type Props = {
  headline: string;
  summary: string;
  reasons: string[];
};

export default function FailureReasonsPanel({
  headline,
  summary,
  reasons,
}: Props) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <h3 className="mb-3 text-sm font-medium text-text-primary">
          {headline}
        </h3>

        <p className="mb-5 text-sm leading-relaxed text-text-secondary">
          {summary}
        </p>

        <ul className="space-y-2 text-sm text-text-secondary">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-text-muted" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
