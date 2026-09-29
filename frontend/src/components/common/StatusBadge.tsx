import type { DeviceStatus } from "../../types/domain.js";

export const badge =
  "inline-flex items-center rounded-full px-[9px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.03em]";

const TONES: Record<DeviceStatus, string> = {
  online: "bg-success-soft text-[#0f7a3d]",
  offline: "bg-offline-soft text-[#47536b]",
};

export function StatusBadge({ status }: { status: DeviceStatus }) {
  return (
    <span className={`${badge} ${TONES[status]}`}>
      {status === "online" ? "Online" : "Offline"}
    </span>
  );
}
