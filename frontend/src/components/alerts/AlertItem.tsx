import type { Alert } from "../../types/domain.js";
import { btnSmall } from "../../styles/ui.js";

interface AlertItemProps {
  alert: Alert;
  onNavigateToDevice: (deviceId: string) => void;
}

const PRIORITY_BORDER: Record<Alert["priority"], string> = {
  urgent: "border-l-urgent",
  warning: "border-l-warning",
};

export function AlertItem({ alert, onNavigateToDevice }: AlertItemProps) {
  const borderColor =
    alert.status === "resolved"
      ? "border-l-success"
      : PRIORITY_BORDER[alert.priority];

  return (
    <li
      className={`flex items-center justify-between gap-2.5 rounded-sm border-l-3 bg-slate-50 px-3 py-2.5 ${borderColor}`}
    >
      <div>
        <p className="text-[12.5px] font-semibold">{alert.message}</p>
        <p className="mt-0.5 text-[11px] text-muted">
          {alert.deviceName} · {alert.buildingName}
        </p>
      </div>
      <button
        type="button"
        className={btnSmall}
        onClick={() => onNavigateToDevice(alert.deviceId)}
      >
        View device
      </button>
    </li>
  );
}
