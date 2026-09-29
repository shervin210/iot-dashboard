import { useState } from "react";
import { KpiCards } from "../components/dashboard/KpiCards.js";
import { DeviceTable } from "../components/devices/DeviceTable.js";
import { DeviceDetailsPanel } from "../components/devices/DeviceDetailsPanel.js";
import { AlertPanel } from "../components/alerts/AlertPanel.js";
import { DeviceMap } from "../components/map/DeviceMap.js";
import { panel, panelTitle } from "../styles/ui.js";
import { useAllDevices } from "../hooks/useDevices.js";

export function DashboardPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    undefined,
  );
  const devices = useAllDevices();

  return (
    <div>
      <KpiCards />

      <div className="grid grid-cols-1 items-start gap-4 min-[981px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <div>
          <DeviceTable
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={setSelectedDeviceId}
          />

          <section className={panel}>
            <h2 className={panelTitle}>Device map</h2>
            <DeviceMap
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              onSelectDevice={setSelectedDeviceId}
            />
          </section>
        </div>

        <div>
          <AlertPanel onNavigateToDevice={setSelectedDeviceId} />
        </div>
      </div>

      {selectedDeviceId && (
        <DeviceDetailsPanel
          deviceId={selectedDeviceId}
          onClose={() => setSelectedDeviceId(undefined)}
        />
      )}
    </div>
  );
}
