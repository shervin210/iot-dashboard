import { useEffect, useRef } from "react";
import { useAlerts, useConnectionStatus } from "../../hooks/useAlerts.js";
import { useToast } from "./ToastContext.js";
export function AlarmNotifier() {
  const { active } = useAlerts();
  const { status } = useConnectionStatus();
  const { addToast } = useToast();
  const seenIds = useRef<Set<string>>(new Set());
  const wasConnected = useRef(false);

  useEffect(() => {
    if (status === "connected" && !wasConnected.current) {
      wasConnected.current = true;
      seenIds.current = new Set(active.map((alert) => alert.id));
      return;
    }
    if (status !== "connected") {
      wasConnected.current = false;
      return;
    }

    for (const alert of active) {
      if (seenIds.current.has(alert.id)) continue;
      seenIds.current.add(alert.id);
      if (alert.priority === "urgent") {
        addToast(
          `${alert.message} — ${alert.deviceName} (${alert.buildingName})`,
          "urgent",
        );
      }
    }
  }, [active, status, addToast]);

  return null;
}
