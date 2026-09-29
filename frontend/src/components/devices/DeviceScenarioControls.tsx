import { useDeviceSimulate } from "../../hooks/useDeviceSimulate.js";
import { btnSmall } from "../../styles/ui.js";
import type { SimulationEventType } from "../../types/domain.js";

const SCENARIOS: { type: SimulationEventType; label: string }[] = [
  { type: "urgent_alarm", label: "Trigger alarm" },
  { type: "technical_fault", label: "Trigger fault" },
  { type: "power_failure", label: "Trigger power loss" },
  { type: "disconnect", label: "Disconnect" },
  { type: "reconnect", label: "Reconnect" },
  { type: "resolve_alarm", label: "Resolve alarm/fault" },
];

export function DeviceScenarioControls({ deviceId }: { deviceId: string }) {
  const { mutate, loading } = useDeviceSimulate();

  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.05em] text-faint">
        Simulate scenario
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.type}
            type="button"
            className={btnSmall}
            disabled={loading}
            onClick={() => mutate(deviceId, scenario.type)}
          >
            {scenario.label}
          </button>
        ))}
      </div>
    </div>
  );
}
