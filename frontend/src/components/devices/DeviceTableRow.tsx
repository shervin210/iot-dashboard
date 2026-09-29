import { StatusBadge } from "../common/StatusBadge.js";
import { PriorityBadge } from "../common/PriorityBadge.js";
import { btnSmall } from "../../styles/ui.js";
import type { Device } from "../../types/domain.js";

interface DeviceTableRowProps {
  device: Device;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const td =
  "whitespace-nowrap border-b border-[#f0f2f6] px-3 py-2.5 text-[13px]";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.max(0, Math.round(diffMs / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function DeviceTableRow({
  device,
  isSelected,
  onSelect,
}: DeviceTableRowProps) {
  return (
    <tr
      className={`cursor-pointer transition-colors duration-100 ${isSelected ? "bg-accent-soft" : "hover:bg-slate-50"}`}
      onClick={() => onSelect(device.id)}
    >
      <td className={td}>
        <div className="text-[13px] font-semibold">{device.name}</div>
        <div className="font-mono text-[10px] text-faint">{device.id}</div>
      </td>
      <td className={td}>{device.buildingName}</td>
      <td className={td}>
        <StatusBadge status={device.status} />
      </td>
      <td className={td}>
        <PriorityBadge priority={device.priority} />
      </td>
      <td className={td}>{device.battery}%</td>
      <td className={td}>{device.signalStrength}%</td>
      <td className={td}>{formatRelativeTime(device.lastSeen)}</td>
      <td className={td}>
        <button
          type="button"
          className={btnSmall}
          onClick={() => onSelect(device.id)}
        >
          View
        </button>
      </td>
    </tr>
  );
}
