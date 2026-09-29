import { AlertItem } from "./AlertItem.js";
import { EmptyState } from "../common/States.js";
import { useAlerts } from "../../hooks/useAlerts.js";
import { panel, panelTitle, panelSubtitle } from "../../styles/ui.js";

const list = "m-0 flex list-none flex-col gap-2 p-0";

export function AlertPanel({
  onNavigateToDevice,
}: {
  onNavigateToDevice: (deviceId: string) => void;
}) {
  const { active, recentlyResolved } = useAlerts();

  return (
    <section className={panel}>
      <h2 className={panelTitle}>Active alerts</h2>
      {active.length === 0 ? (
        <EmptyState message="No active alerts." />
      ) : (
        <ul className={list}>
          {active.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onNavigateToDevice={onNavigateToDevice}
            />
          ))}
        </ul>
      )}

      {recentlyResolved.length > 0 && (
        <>
          <h3 className={panelSubtitle}>Recently resolved</h3>
          <ul className={`${list} opacity-70`}>
            {recentlyResolved.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onNavigateToDevice={onNavigateToDevice}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
