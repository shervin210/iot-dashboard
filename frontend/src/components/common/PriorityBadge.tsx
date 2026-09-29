import type { DevicePriority } from "../../types/domain.js";
import { badge } from "./StatusBadge.js";

const LABELS: Record<DevicePriority, string> = {
  normal: "Normal",
  warning: "Warning",
  urgent: "Urgent",
};

const TONES: Record<DevicePriority, string> = {
  normal: "bg-accent-soft text-blue-700",
  warning: "bg-warning-soft text-[#a05a05]",
  urgent: "bg-urgent-soft text-[#a51c1c]",
};

export function PriorityBadge({ priority }: { priority: DevicePriority }) {
  return (
    <span className={`${badge} ${TONES[priority]}`}>{LABELS[priority]}</span>
  );
}
