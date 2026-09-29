import { useDashboardSummary } from "../../hooks/useAlerts.js";

interface KpiCardProps {
  label: string;
  value: number;
}

const cardBase =
  "flex items-center gap-3.5 rounded-lg border border-border bg-surface p-4.5 shadow-card";

function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div className={cardBase}>
      <div>
        <p className="text-[22px] font-bold tracking-[-0.02em]">{value}</p>
        <p className="mt-0.5 text-[12px] text-muted">{label}</p>
      </div>
    </div>
  );
}

const row = "mb-5 grid grid-cols-2 gap-3.5 min-[981px]:grid-cols-4";

export function KpiCards() {
  const summary = useDashboardSummary();

  if (!summary) {
    return (
      <div className={row} aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`${cardBase} h-19 animate-shimmer bg-[linear-gradient(90deg,#eef1f6_25%,#f6f8fb_37%,#eef1f6_63%)] bg-size-[400%_100%]`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={row}>
      <KpiCard label="Total devices" value={summary.totalDevices} />
      <KpiCard label="Online" value={summary.onlineDevices} />
      <KpiCard label="Urgent alarms" value={summary.urgentAlarms} />
      <KpiCard label="Technical faults" value={summary.technicalFaults} />
    </div>
  );
}
