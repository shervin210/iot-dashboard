import { StatusBadge } from "../common/StatusBadge.js";
import { PriorityBadge } from "../common/PriorityBadge.js";
import { Sparkline } from "../common/Sparkline.js";
import { LoadingState, ErrorState } from "../common/States.js";
import { DeviceScenarioControls } from "./DeviceScenarioControls.js";
import { btnSmall } from "../../styles/ui.js";
import { useDeviceDetails } from "../../hooks/useDeviceDetails.js";
import type { Device } from "@/types/domain.js";

interface DeviceDetailsPanelProps {
  deviceId: string;
  onClose: () => void;
}

export function DeviceDetailsPanel({
  deviceId,
  onClose,
}: DeviceDetailsPanelProps) {
  const { device, history, loading, error } = useDeviceDetails(deviceId);
  function getDetailFields(device: Device) {
    return [
      { label: "Building", value: device.buildingName },
      { label: "Battery", value: `${device.battery}%` },
      { label: "Signal strength", value: `${device.signalStrength}%` },
      { label: "Temperature", value: `${device.temperature}°C` },
      { label: "AC power", value: device.acPower ? "On" : "Lost" },
      { label: "Faults", value: device.hasFaults ? "Active" : "None" },
      { label: "Urgent alarm", value: device.urgentAlarm ? "Active" : "None" },
      {
        label: "Last seen",
        value: new Date(device.lastSeen).toLocaleTimeString(),
      },
    ];
  }
  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-[min(380px,100%)] overflow-y-auto border-l border-border bg-surface p-5 shadow-[-8px_0_24px_rgba(15,32,66,0.08)]"
      aria-label="Device details"
    >
      <div className="mb-3.5 flex items-start justify-between">
        <h2 className="text-base">{device?.name ?? deviceId}</h2>
        <button
          type="button"
          className={btnSmall}
          onClick={onClose}
          aria-label="Close details"
        >
          ✕
        </button>
      </div>

      {loading && !device && <LoadingState label="Loading device…" />}
      {error && !device && <ErrorState message={error} />}

      {device && (
        <div>
          <div className="mb-4 flex gap-2">
            <StatusBadge status={device.status} />
            <PriorityBadge priority={device.priority} />
          </div>

          <dl className="mx-0 mt-0 mb-4.5 grid grid-cols-2 gap-3">
            {getDetailFields(device).map(({ label, value }) => (
              <div key={label}>
                <dt className="mb-0.5 text-[10px] uppercase tracking-[0.05em] text-faint">
                  {label}
                </dt>
                <dd className="m-0 text-[13px] font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mb-4.5">
            <p className="mb-1.5 text-[11px] text-muted">Battery trend</p>
            <Sparkline
              values={history.map((point) => point.battery)}
              min={0}
              max={100}
            />
          </div>

          <DeviceScenarioControls deviceId={device.id} />
        </div>
      )}
    </aside>
  );
}
